import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import cors from "cors";
import { IsNull } from "typeorm";

const app = express();
const port = 5050;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//routes
app.get("/", (_req, res) => {
  res.send("Running!");
});

AppDataSource.initialize()
  .then(() => {
    console.log("성공");
  })
  .catch((err) => {
    console.error("실패", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//POST /users 생성
app.post("/users", async (req, res) => {
  // status는 항상 ACTIVE로 생성
  const user = await AppDataSource.getRepository(User).create({
    ...req.body,
    status: "ACTIVE",
  });
  console.log(user);
  const results = await AppDataSource.getRepository(User).save(user);
  return res.send(results);
});

//GET /users 조회
app.get("/users", async (req, res) => {
  // 삭제된 사용자(DELETED)는 제외. 과거 데이터(null)도 조회에 포함.
  const users = await AppDataSource.getRepository(User).find({
    where: [{ status: "ACTIVE" }, { status: IsNull() }],
  });
  return res.send(users);
});

//GET /users 조회 | id로 조회
app.get("/users/:id", async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({
    where: [
      { id: Number(req.params.id), status: "ACTIVE" },
      { id: Number(req.params.id), status: IsNull() },
    ],
  });
  if (!user) return res.status(404).send("User not found");
  return res.send(user);
});

//PUT /users/:id 수정
app.put("/users/:id", async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({
    where: [
      { id: Number(req.params.id), status: "ACTIVE" },
      { id: Number(req.params.id), status: IsNull() },
    ],
  });
  if (!user) {
    return res.status(404).send("User not found");
  }
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.age = req.body.age;
  const results = await repo.save(user);
  return res.send(results);
});

//DELETE /users/:id 삭제
app.delete("/users/:id", async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({
    where: [
      { id: Number(req.params.id), status: "ACTIVE" },
      { id: Number(req.params.id), status: IsNull() },
    ],
  });
  if (!user) {
    return res.status(404).send("User not found");
  }
  // 소프트 삭제: 상태를 DELETED로 변경
  user.status = "DELETED";
  const results = await repo.save(user);
  return res.send(results);
});

//POST /users/:id/login 로그인
