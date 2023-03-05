import type { Table } from 'cli-table3';

class TableBox {
  accessor table: Table | undefined;

  clear() {
    this.table = undefined;
  }
}

const table = new TableBox();

export default table;
