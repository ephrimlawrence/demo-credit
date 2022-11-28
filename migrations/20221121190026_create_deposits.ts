import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('deposits', function (table) {
    table.increments();
    table.bigInteger('amount');
    table.integer('accountId').notNullable().unsigned();
    table.foreign("accountId").references("id").inTable("accounts");
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('deposits');
}
