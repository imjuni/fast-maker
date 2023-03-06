# Options

## Table of Contents <!-- omit in toc -->

- [command list](#command-list)
- [`route`, `r` Option](#route-r-option)
- [`watch`, `w` Option](#watch-w-option)

## command list

| command | alias | description                                                   |
| :------ | :---- | :------------------------------------------------------------ |
| route   | r     | route configuration file generate                             |
| watch   | w     | watch handler directory and route configuration file generate |
| init    | i     | create configuration file: `.fastmakerrc`                     |

## `route`, `r` Option

| name                  | required | alias | desc.                                                                                                         |
| :-------------------- | :------: | :---: | :------------------------------------------------------------------------------------------------------------ |
| --handler             | required |  -a   | API handler path                                                                                              |
| --project             | required |  -p   | tsconfig path                                                                                                 |
| --config              |          |  -c   | configuration file path                                                                                       |
| --output              |          |  -o   | route.ts file generate on output directory. Default value is route handler directory(--handler option passed) |
| --skip-error          |          |       | skip compile error on project source file                                                                     |
| --cli-logo            |          |       | display cli logo                                                                                              |
| --route-map           |          |       | create route-map source file                                                                                  |
| --max-workers         |          |       | max worker count                                                                                              |
| --worker-timeout      |          |       | route code generation worker timeout: default 90 seconds                                                      |
| --use-default-export  |          |       | route function in output file that use default export                                                         |
| --route-function-name |          |       | rotue function name                                                                                           |

## `watch`, `w` Option

| name                  | required | alias | desc.                                                                                                         |
| :-------------------- | :------: | :---: | :------------------------------------------------------------------------------------------------------------ |
| --handler             | required |  -a   | API handler path                                                                                              |
| --project             | required |  -p   | tsconfig path                                                                                                 |
| --config              |          |  -c   | configuration file path                                                                                       |
| --output              |          |  -o   | route.ts file generate on output directory. Default value is route handler directory(--handler option passed) |
| --skip-error          |          |       | skip compile error on project source file                                                                     |
| --cli-logo            |          |       | display cli logo                                                                                              |
| --route-map           |          |       | create route-map source file                                                                                  |
| --max-workers         |          |       | max worker count                                                                                              |
| --worker-timeout      |          |       | route code generation worker timeout: default 90 seconds                                                      |
| --use-default-export  |          |       | route function in output file that use default export                                                         |
| --route-function-name |          |       | rotue function name                                                                                           |
| --debounce-time       |          |       | watch file debounceTime. unit use milliseconds                                                                |
