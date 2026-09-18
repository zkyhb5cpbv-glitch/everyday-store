import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),name:text('name').notNull(),category:text('category').notNull(),price:integer('price').notNull(),image:text('image').notNull()});
export const settings=sqliteTable('settings',{id:text('id').primaryKey(),value:text('value').notNull()});
export const orders=sqliteTable('orders',{id:text('id').primaryKey(),total:integer('total').notNull(),items:text('items').notNull(),token:text('token').notNull(),last4:text('last4').notNull(),expiry:text('expiry').notNull(),created:text('created').notNull(),checkoutDetails:text('checkout_details')});
