import { 
  type ParcTalkToken, 
  type ParcTalkNode, 
  type ParcTalkProgram,
  type CardNode,
  type CommandNode,
  type AnimateNode,
  type FlowNode,
  type ParcTalkValue,
  KEYWORDS,
  isKeyword,
  isOperator,
  isPunctuation 
} from './core';

export class ParcTalkLexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: ParcTalkToken[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): ParcTalkToken[] {
    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.position >= this.input.length) break;

      const char = this.current();

      if (char === '\n') {
        this.tokens.push({ type: 'newline', value: '\n', line: this.line, column: this.column });
        this.advance();
        this.line++;
        this.column = 1;
        continue;
      }

      if (char === '/' && this.peek() === '/') {
        this.skipLineComment();
        continue;
      }

      if (char === '/' && this.peek() === '*') {
        this.skipBlockComment();
        continue;
      }

      if (char === '"' || char === "'") {
        this.readString(char);
        continue;
      }

      if (this.isDigit(char)) {
        this.readNumber();
        continue;
      }

      if (this.isAlpha(char)) {
        this.readIdentifier();
        continue;
      }

      if (isPunctuation(char)) {
        this.tokens.push({ type: 'punctuation', value: char, line: this.line, column: this.column });
        this.advance();
        continue;
      }

      if (this.isOperatorStart(char)) {
        this.readOperator();
        continue;
      }

      this.advance();
    }

    return this.tokens;
  }

  private current(): string {
    return this.input[this.position];
  }

  private peek(offset: number = 1): string {
    return this.input[this.position + offset] || '';
  }

  private advance(): void {
    this.position++;
    this.column++;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length) {
      const char = this.current();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private skipLineComment(): void {
    while (this.position < this.input.length && this.current() !== '\n') {
      this.advance();
    }
  }

  private skipBlockComment(): void {
    this.advance();
    this.advance();
    while (this.position < this.input.length) {
      if (this.current() === '*' && this.peek() === '/') {
        this.advance();
        this.advance();
        break;
      }
      if (this.current() === '\n') {
        this.line++;
        this.column = 0;
      }
      this.advance();
    }
  }

  private readString(quote: string): void {
    const startColumn = this.column;
    this.advance();
    let value = '';
    while (this.position < this.input.length && this.current() !== quote) {
      if (this.current() === '\\' && this.peek() === quote) {
        this.advance();
        value += this.current();
      } else {
        value += this.current();
      }
      this.advance();
    }
    this.advance();
    this.tokens.push({ type: 'string', value, line: this.line, column: startColumn });
  }

  private readNumber(): void {
    const startColumn = this.column;
    let value = '';
    while (this.position < this.input.length && (this.isDigit(this.current()) || this.current() === '.')) {
      value += this.current();
      this.advance();
    }
    this.tokens.push({ type: 'number', value, line: this.line, column: startColumn });
  }

  private readIdentifier(): void {
    const startColumn = this.column;
    let value = '';
    while (this.position < this.input.length && (this.isAlpha(this.current()) || this.isDigit(this.current()) || this.current() === '_')) {
      value += this.current();
      this.advance();
    }
    const type = isKeyword(value) ? 'keyword' : 'identifier';
    this.tokens.push({ type, value, line: this.line, column: startColumn });
  }

  private readOperator(): void {
    const startColumn = this.column;
    let value = this.current();
    this.advance();
    
    const twoChar = value + this.current();
    if (isOperator(twoChar)) {
      value = twoChar;
      this.advance();
    }
    
    this.tokens.push({ type: 'operator', value, line: this.line, column: startColumn });
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isOperatorStart(char: string): boolean {
    return /[.=!<>+\-*/%&|:]/.test(char);
  }
}

export class ParcTalkParser {
  private tokens: ParcTalkToken[];
  private position: number = 0;

  constructor(tokens: ParcTalkToken[]) {
    this.tokens = tokens.filter(t => t.type !== 'newline');
  }

  parse(): ParcTalkProgram {
    const statements: ParcTalkNode[] = [];
    
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    return { type: 'program', statements };
  }

  private parseStatement(): ParcTalkNode | null {
    const token = this.current();

    if (!token) return null;

    if (token.type === 'keyword') {
      switch (token.value) {
        case 'card':
          return this.parseCard();
        case 'open':
        case 'close':
          return this.parseOpenClose();
        case 'animate':
          return this.parseAnimate();
        case 'set':
          return this.parseSet();
        case 'fog':
        case 'meaning':
        case 'cmfk':
          return this.parseCMFKCommand();
        case 'window':
        case 'dock':
          return this.parseUICommand();
        case 'bill':
          return this.parseBillCommand();
        default:
          this.advance();
          return null;
      }
    }

    if (token.type === 'identifier') {
      return this.parseExpression();
    }

    this.advance();
    return null;
  }

  private parseCard(): CardNode {
    this.expect('keyword', 'card');
    const nameToken = this.expect('string');
    this.expect('punctuation', '{');
    
    const body: ParcTalkNode[] = [];
    while (!this.check('punctuation', '}') && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    
    this.expect('punctuation', '}');

    return {
      type: 'card',
      name: nameToken.value,
      body
    };
  }

  private parseOpenClose(): CommandNode {
    const action = this.advance().value;
    this.expect('punctuation', '(');
    const args: ParcTalkValue[] = [];
    
    if (!this.check('punctuation', ')')) {
      args.push(this.parseValue());
      while (this.check('punctuation', ',')) {
        this.advance();
        args.push(this.parseValue());
      }
    }
    
    this.expect('punctuation', ')');
    this.consumeOptional('punctuation', ';');

    return { type: 'command', action, args };
  }

  private parseAnimate(): AnimateNode {
    this.expect('keyword', 'animate');
    const animation = this.advance().value;
    
    let options: { [key: string]: any } | undefined;
    if (this.check('punctuation', '{')) {
      options = this.parseObject();
    }
    
    this.consumeOptional('punctuation', ';');

    return { type: 'animate', animation, options };
  }

  private parseSet(): CommandNode {
    this.expect('keyword', 'set');
    this.expect('operator', '.');
    const target = this.advance().value;
    this.expect('punctuation', '(');
    
    const args: ParcTalkValue[] = [];
    if (!this.check('punctuation', ')')) {
      args.push(this.parseValue());
    }
    
    this.expect('punctuation', ')');
    this.consumeOptional('punctuation', ';');

    return { type: 'command', target: 'set', action: target, args };
  }

  private parseCMFKCommand(): CommandNode {
    const target = this.advance().value;
    this.expect('operator', '.');
    const action = this.advance().value;
    this.expect('punctuation', '(');
    
    const args: ParcTalkValue[] = [];
    if (!this.check('punctuation', ')')) {
      args.push(this.parseValue());
      while (this.check('punctuation', ',')) {
        this.advance();
        args.push(this.parseValue());
      }
    }
    
    this.expect('punctuation', ')');
    this.consumeOptional('punctuation', ';');

    return { type: 'command', target, action, args };
  }

  private parseUICommand(): CommandNode {
    const target = this.advance().value;
    this.expect('punctuation', '(');
    const cardName = this.parseValue();
    this.expect('punctuation', ')');
    this.expect('operator', '.');
    const action = this.advance().value;
    this.expect('punctuation', '(');
    
    const args: ParcTalkValue[] = [cardName];
    if (!this.check('punctuation', ')')) {
      if (this.current()?.type === 'identifier' && this.peek()?.value === ':') {
        args.push(this.parseObject());
      } else {
        args.push(this.parseValue());
        while (this.check('punctuation', ',')) {
          this.advance();
          args.push(this.parseValue());
        }
      }
    }
    
    this.expect('punctuation', ')');
    this.consumeOptional('punctuation', ';');

    return { type: 'command', target, action, args };
  }

  private parseBillCommand(): CommandNode {
    this.expect('keyword', 'bill');
    this.expect('operator', '.');
    const action = this.advance().value;
    this.expect('punctuation', '(');
    
    const args: ParcTalkValue[] = [];
    if (!this.check('punctuation', ')')) {
      args.push(this.parseValue());
    }
    
    this.expect('punctuation', ')');
    this.consumeOptional('punctuation', ';');

    return { type: 'command', target: 'bill', action, args };
  }

  private parseExpression(): CommandNode {
    const target = this.advance().value;
    
    if (this.check('operator', '.')) {
      this.advance();
      const action = this.advance().value;
      
      if (this.check('punctuation', '(')) {
        this.advance();
        const args: ParcTalkValue[] = [];
        
        if (!this.check('punctuation', ')')) {
          args.push(this.parseValue());
          while (this.check('punctuation', ',')) {
            this.advance();
            args.push(this.parseValue());
          }
        }
        
        this.expect('punctuation', ')');
        this.consumeOptional('punctuation', ';');
        
        return { type: 'command', target, action, args };
      }
    }

    return { type: 'command', action: target, args: [] };
  }

  private parseValue(): ParcTalkValue {
    const token = this.current();
    
    if (!token) return null;

    if (token.type === 'string') {
      this.advance();
      return token.value;
    }

    if (token.type === 'number') {
      this.advance();
      return parseFloat(token.value);
    }

    if (token.type === 'keyword') {
      if (token.value === 'true') {
        this.advance();
        return true;
      }
      if (token.value === 'false') {
        this.advance();
        return false;
      }
      if (token.value === 'null') {
        this.advance();
        return null;
      }
    }

    if (token.type === 'identifier') {
      if (this.peek()?.value === ':') {
        return this.parseObject();
      }
      this.advance();
      return token.value;
    }

    if (this.check('punctuation', '{')) {
      return this.parseObject();
    }

    if (this.check('punctuation', '[')) {
      return this.parseArray();
    }

    this.advance();
    return null;
  }

  private parseObject(): { [key: string]: any } {
    const obj: { [key: string]: any } = {};
    
    const hasOpenBrace = this.check('punctuation', '{');
    if (hasOpenBrace) {
      this.advance();
    }
    
    while (!this.check('punctuation', '}') && !this.check('punctuation', ')') && !this.isAtEnd()) {
      const keyToken = this.advance();
      if (keyToken.type !== 'identifier' && keyToken.type !== 'string') break;
      
      this.expect('operator', ':');
      obj[keyToken.value] = this.parseValue();
      
      this.consumeOptional('punctuation', ',');
    }
    
    if (hasOpenBrace) {
      this.consumeOptional('punctuation', '}');
    }
    
    return obj;
  }

  private parseArray(): ParcTalkValue[] {
    this.expect('punctuation', '[');
    const arr: ParcTalkValue[] = [];
    
    while (!this.check('punctuation', ']') && !this.isAtEnd()) {
      arr.push(this.parseValue());
      this.consumeOptional('punctuation', ',');
    }
    
    this.expect('punctuation', ']');
    return arr;
  }

  private current(): ParcTalkToken | undefined {
    return this.tokens[this.position];
  }

  private peek(offset: number = 1): ParcTalkToken | undefined {
    return this.tokens[this.position + offset];
  }

  private advance(): ParcTalkToken {
    const token = this.tokens[this.position];
    this.position++;
    return token;
  }

  private check(type: string, value?: string): boolean {
    const token = this.current();
    if (!token) return false;
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    return true;
  }

  private expect(type: string, value?: string): ParcTalkToken {
    const token = this.current();
    if (!token || token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(`Expected ${type}${value ? ` '${value}'` : ''} at line ${token?.line || '?'}, column ${token?.column || '?'}`);
    }
    return this.advance();
  }

  private consumeOptional(type: string, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length;
  }
}

export function parseScript(source: string): ParcTalkProgram {
  const lexer = new ParcTalkLexer(source);
  const tokens = lexer.tokenize();
  const parser = new ParcTalkParser(tokens);
  return parser.parse();
}
