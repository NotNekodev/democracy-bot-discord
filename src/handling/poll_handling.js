const db = require('../utils/sqlite_shit.js');

async function handle_poll_end(poll_message) {
    const poll = await db.get_vote(poll_message.id);

    if (!poll) {
        console.error(`Poll not found for message ID: ${poll_message.id}`);
        return;
    }

    if (poll_message.poll.resultsFinalized) {
        console.log(`Poll ${poll_message.id} has already ended.`);
        return;
    }

    console.log(`Poll ${poll_message.id} has ended!`);

    const results = poll_message.poll.answers.map(answer => ({
        text: answer.text,
        votes: answer.voteCount
    }));

    const winner = results.reduce((max, current) => current.votes > max.votes ? current : max);

    console.log(`The winner is: ${winner.text} with ${winner.votes} votes`);

    let won = false;

    if (winner.text === "Yes") {
        won = true;
    }

    poll_message.channel.send(`The vote has ended! ${won ? "Yes" : "No"} was the final verdict.`);

    if (!poll_message.channel.isThread()) {
        console.warn(`Poll ${poll_message.id} has ended but is not in a thread.`);
    } else {
        if (poll_message.channel.locked) {
            console.warn(`Poll ${poll_message.id} has ended but the channel is locked.`);
        } else {
            await poll_message.channel.setLocked(true, "The vote has ended");
        }
    }

    await db.seal_vote(poll_message.id, Math.floor(Date.now() / 1000), won ? "Yes" : "No");
}

module.exports = handle_poll_end;