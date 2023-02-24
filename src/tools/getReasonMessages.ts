import type IReason from '#compilers/interfaces/IReason';
import chalk from 'chalk';
import path from 'path';

export default function getReasonMessages(reasons: IReason[]): string {
  const messages = reasons.map((reason) => {
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
