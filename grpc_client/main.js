const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("todo.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

const what = process.argv[2];
const client = new todoPackage.TodoService("127.0.0.1:50005", grpc.credentials.createInsecure());

console.log(client.createTodo)

client.createTodo({
  "id": -1,
  "content": what
}, (err, response) => {
    console.log("Recevied from server: " + JSON.stringify(response));
})
