import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('deposits', function (table) {
    table.increments();
    table.bigInteger('amount');
    table.integer('account_id').notNullable();
    // table.integer('account_id').references('id').inTable('accounts');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('deposits');
}
