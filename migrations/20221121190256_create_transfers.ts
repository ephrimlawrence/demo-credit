import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('transfers', function (table) {
        table.increments();
        table.bigInteger('amount');
        table.integer('fromAccountId').notNullable().unsigned();
        table.foreign("fromAccountId").references("id").inTable("accounts");

        table.integer('toAccountId').notNullable().unsigned();
        table.foreign("toAccountId").references("id").inTable("accounts");

        // table.integer('from_account_id').references('id').inTable('accounts');
        // table.integer('to_account_id').references('id').inTable('accounts');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('transfers');
}
