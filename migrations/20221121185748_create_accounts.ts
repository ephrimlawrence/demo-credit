import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('accounts', function (table) {
    table.increments();
    table.bigInteger('balance');
    table.string('currency').notNullable();
    table.string('accountNo').notNullable();
    table.integer('userId').notNullable().unsigned();
    table.foreign("userId").references("id").inTable("users");
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('accounts');
}
