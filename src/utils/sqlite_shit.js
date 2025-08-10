const sqlite = require('sqlite-async');
const config = require('../config');


var db = new sqlite.Database();
var prepared_statements = [];

async function prepare_db(){
    await db.open("db.sqlite");
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            rep INTEGER,
            UNIQUE(id)
        )
    `); 

    db.exec(`
        CREATE TABLE IF NOT EXISTS votes (
            msg_id TEXT PRIMARY KEY,
            thread_id TEXT,
            user_id TEXT,
            expires INTEGER,

            sealed BOOlEAN,
            deletion_date INTEGER,
            final_verdict TEXT,

            act TEXT,
            description TEXT,
            arg1 TEXT,
            arg2 TEXT,
            arg3 TEXT,
            arg4 TEXT,
            arg5 TEXT,
            UNIQUE(msg_id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY,
            title TEXT,
            description TEXT,
            UNIQUE(id)
        )
    `);

    prepared_statements["add_user"] = await db.prepare("INSERT INTO users (id, rep) VALUES (?, ?)");
    prepared_statements["get_user"] = await db.prepare("SELECT * FROM users WHERE id = ?");
    prepared_statements["update_user"] = await db.prepare("UPDATE users SET rep = ? WHERE id = ?");
    prepared_statements["delete_user"] = await db.prepare("DELETE FROM users WHERE id = ?");

    prepared_statements["create_vote"] = await db.prepare("INSERT INTO votes (msg_id, thread_id, user_id, expires, sealed, deletion_date, final_verdict, act, description, arg1, arg2, arg3, arg4, arg5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    prepared_statements["get_votes"] = await db.prepare("SELECT * FROM votes");
    prepared_statements["get_vote"] = await db.prepare("SELECT * FROM votes WHERE msg_id = ?");
    prepared_statements["seal_vote"] = await db.prepare("UPDATE votes SET sealed = true, deletion_date = ?, final_verdict = ? WHERE msg_id = ?");
    prepared_statements["delete_vote"] = await db.prepare("DELETE FROM votes WHERE msg_id = ?");

    prepared_statements["add_rule"] = await db.prepare("INSERT INTO rules (id, title, description) VALUES (?, ?, ?)");
    prepared_statements["get_rules"] = await db.prepare("SELECT * FROM rules");
    prepared_statements["delete_rule"] = await db.prepare("DELETE FROM rules WHERE id = ?");
}

async function close_db(){
    await db.close();
}

async function add_user(id){
    await prepared_statements["add_user"].run(id, config.get_config().starting_rep);
}

async function get_user(id){
    return await prepared_statements["get_user"].get(id);
}

async function update_user(id, rep){
    await prepared_statements["update_user"].run(rep, id);
}

async function delete_user(id){
    await prepared_statements["delete_user"].run(id);
}

async function create_vote(msg_id, thread_id, user_id, expires, act, description, arg1, arg2, arg3, arg4, arg5){
    await prepared_statements["create_vote"].run(msg_id, thread_id, user_id, expires, false, null, null, act, description, arg1, arg2, arg3, arg4, arg5);
}

async function get_votes(){
    return await prepared_statements["get_votes"].all();
}

async function get_vote(msg_id){
    return await prepared_statements["get_vote"].get(msg_id);
}

async function seal_vote(msg_id, deletion_date, final_verdict){
    await prepared_statements["seal_vote"].run(deletion_date, final_verdict, msg_id);
}

async function delete_vote(msg_id){
    await prepared_statements["delete_vote"].run(msg_id);
}

async function add_rule(id, title, description){
    await prepared_statements["add_rule"].run(id, title, description);
}

async function get_rules(){
    return await prepared_statements["get_rules"].all();
}

async function delete_rule(id){
    await prepared_statements["delete_rule"].run(id);
}

module.exports = {
    prepare_db: prepare_db,
    close_db: close_db,
    add_user: add_user,
    get_user: get_user,
    update_user: update_user,
    delete_user: delete_user,
    create_vote: create_vote,
    get_votes: get_votes,
    get_vote: get_vote,
    seal_vote: seal_vote,
    delete_vote: delete_vote,
    add_rule: add_rule,
    get_rules: get_rules,
    delete_rule: delete_rule
}