import express from "express";

const server = express();

server.post("/message", express.json(), (req, res) => {
    const { message } = req.body as { message: string };
    console.log(message);
    res.end();
});

server.listen(8081, () => {
    console.log("server listening on port 8081.");
});