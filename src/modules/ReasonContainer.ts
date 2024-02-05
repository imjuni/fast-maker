import type { IReason } from '#/compilers/interfaces/IReason';
import chalk from 'chalk';
import path from 'node:path';

export class ReasonContainer {
  static #it: ReasonContainer;

  static #isBootstrap = false;

  static get it(): Readonly<ReasonContainer> {
    return ReasonContainer.#it;
  }

  static bootstrap() {
    if (ReasonContainer.#isBootstrap) {
      return;
    }

    ReasonContainer.#it = new ReasonContainer();
    ReasonContainer.#isBootstrap = true;
  }

  static aggregate(reasons: IReason[]): IReason[] {
    const aggregated = reasons.reduce<Record<IReason['type'], IReason[]>>(
      (aggregation, reason) => {
        return { ...aggregation, [reason.type]: [...aggregation[reason.type], reason] };
      },
      {
        error: [],
        warn: [],
      },
    );

    return [...aggregated.warn, ...aggregated.error];
  }

  #reasons: IReason[];

  constructor() {
    this.#reasons = [];
  }

  get reasons() {
    return this.#reasons;
  }

  add(...reasons: IReason[]) {
    this.#reasons.push(...reasons);
  }

  clear() {
    this.#reasons = [];
  }

  show() {
    const messages = this.#reasons.map((reason) => {
      const messageBuf = [''];

      const typeMessage =
        reason.type === 'error'
          ? chalk.bgRed(`   ${reason.type.toUpperCase()}   `)
          : chalk.bgYellow(`   ${reason.type.toUpperCase()}    `);

      const { filePath } = reason;

      const filename =
        reason.lineAndCharacter == null
          ? `${path.basename(filePath)}`
          : `${path.basename(filePath)}:${reason.lineAndCharacter.line}:${reason.lineAndCharacter.character}`;

      const chevronRight = reason.type === 'error' ? chalk.red('>') : chalk.yellow('>');

      messageBuf.push(`${typeMessage} ${filename}`);

      if (reason.lineAndCharacter == null) {
        messageBuf.push(`   ${chevronRight} ${chalk.gray(`${filePath}`)}`);
      } else {
        messageBuf.push(
          `   ${chevronRight} ${chalk.gray(
            `${filePath}:${reason.lineAndCharacter.line}:${reason.lineAndCharacter.character}`,
          )}`,
        );
      }

      messageBuf.push(
        ...reason.message.split('\n').map((splittedMessage) => {
          return `   ${chevronRight} ${chalk.gray(splittedMessage.trim())}`;
        }),
      );

      messageBuf.push('');

      return messageBuf;
    });

    return messages.flat().join('\n');
  }
}
