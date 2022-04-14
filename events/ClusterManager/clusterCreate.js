module.exports = (cluster) => {
    cluster.on('message', message => {
        if (!message._sRequest) return;
        const script = cluster.manager.ipcScripts.get(message.type);
        if (!script) {
            message.reply({ error: true });
            throw new Error(`IPC script of type: ${message.type} isn't avaliable`, __dirname); 
        }
        else script.run(cluster, message);
    });
};