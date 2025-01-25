import db from '../../db-knex'

db.schema.hasTable('auths').then((exists) => {
    if (!exists) {
        db.schema.createTable('auths', (table) => {
            table.string('username').notNullable().unique();
            table.string('password').notNullable();
            table.string('profilePublicId').notNullable();
            table.string('email').notNullable().unique();
            table.string('country').notNullable();
            table.string('profilePicture').notNullable();
            table.string('emailVerificationToken').nullable();
            table.boolean('emailVerified').notNullable().defaultTo(false);
            table.string('browserName').nullable().defaultTo('test');
            table.string('deviceType').nullable().defaultTo('iphone');
            table.string('otp').nullable();
            table.dateTime('otpExpiration').notNullable().defaultTo(db.fn.now());
            table.dateTime('createdAt').defaultTo(db.fn.now());
            table.string('passwordResetToken').nullable();
            table.dateTime('passwordResetExpires').notNullable().defaultTo(db.fn.now());

            // Tạo các chỉ mục (indexes)
            table.unique(['email']);
            table.unique(['username']);
            table.unique(['emailVerificationToken']);
        })
            .then(() => {
                console.log('Table auths created!');
            })
            .catch((error) => {
                console.error('Error creating table:', error);
            });
    } else {
        console.log('Table auths already exists.');
    }
});