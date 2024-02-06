# Options

## Table of Contents <!-- omit in toc -->

- [command list](#command-list)
- [`route`, `r` Option](#route-r-option)

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
| --templates           |          |       | path of the template files                                                                                    |
| --ext-kind            |          |       | module, route file extensions processing style in route.ts                                                    |
| --cli-logo            |          |       | display cli logo                                                                                              |
| --route-map           |          |       | create route-map source file                                                                                  |
| --use-default-export  |          |       | route function in output file that use default export                                                         |
| --route-function-name |          |       | rotue function name                                                                                           |

---
