const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('./db');
const app = require('../app');
const isSamePassword = require('./bcrypt').isSamePassword;

passport.use(new LocalStrategy(
    function (username, password, done) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];

        pool.query(query, values, async function (err, result) {
            if (err) { return done(err); }
            const user = result.rows[0];
            if (!user) { return done(null, false); }

            try {
                const isSame = await isSamePassword(user.password, password);
                if (!isSame) { return done(null, false); }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        });
    }
));

passport.serializeUser(function (user, done) {
    console.log('serializeUser', user);
    done(null, user.id);
}
);

passport.deserializeUser(function (id, done) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const values = [parseInt(id)];
    pool.query(query, values, function (err, result) {
        if (err) { return done(err); }
        const user = result.rows[0];
        console.log('deserializeUser', user)
        done(null, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());