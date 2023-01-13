import React, { useEffect, useState } from "react";
import { styles } from "../../styles";
import { Input, DatePickerProps } from "antd";
import { DatePicker, Select, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

const onChange: DatePickerProps["onChange"] = (date, dateString) => {};

interface sendData {
  createdDate: string;
  title: string;
  description: string;
  dueDate: string;
  tags: string[];
  status: string;
}

const EditTodo = () => {
  let param = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [todo, setTodo] = useState<sendData>();
  const [event, setEvent] = useState<any>();

  // modal related logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = (e: any) => {
    e.preventDefault();
    setEvent(e);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    dataSubmitHandler(event);
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  /////////////////////////

  const getTodo = async (id: string | undefined) => {
    if (id === undefined) {
      alert("something went wrong");
    }
    try {
      const res = await axios.get(
        "https://enhancedtodoapp-production.up.railway.app/todos/" + id
      );
      return res.data;
    } catch (e: any) {
      console.log(e);
      alert(e.message);
    }
  };

  useEffect(() => {
    const route_param = param.id;
    getTodo(route_param).then((todo) => {
      setTags((tag) => [...todo.tags]);
      setTodo({
        createdDate: todo.createdDate,
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        tags: todo.tags,
        status: todo.status,
      });
    });
  }, []);

  const handleChange = (value: string) => {
    setStatus(value);
  };

  const addTags = (event: any) => {
    if (event.key === "Enter") {
      let value = event.target.value;
      setTags((t) => [...t, value]);
      event.target.value = "";
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, ind) => index !== ind));
  };

  const dataSubmitHandler = (e: any) => {
    e.preventDefault();

    let day: string = new Date().getDate().toString();
    let day_num: number = parseInt(day);
    if (day_num >= 0 && day_num <= 9) {
      day = "0" + day;
    }
    let month: string = (new Date().getMonth() + 1).toString();
    let month_num: number = parseInt(month);
    if (month_num >= 0 && month_num <= 9) {
      month = "0" + month;
    }
    let year: string = new Date().getFullYear().toString();

    const values: sendData = {
      createdDate: year + "-" + month + "-" + day,
      title: e.target[0].value,
      description: e.target[1].value,
      dueDate: e.target[2].value,
      tags: tags,
      status: status === "" ? "OPEN" : status,
    };
    const route_param = param.id;
    try {
      const res = axios.put(
        "https://enhancedtodoapp-production.up.railway.app/todos/" +
          route_param,
        values
      );
      return navigate("/");
    } catch (e: any) {
      console.log(e);
      alert(e.message());
    }
  };

  const { TextArea } = Input;

  return (
    <div style={{ width: "60vw", margin: "auto" }}>
      <Modal
        title="Confirm save"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to save ?</p>
      </Modal>
      <h1 style={{ textAlign: "center", marginTop: "50px" }}>Edit todo</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        {todo === undefined ? (
          <p>Loading...</p>
        ) : (
          <div>
            <form
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onSubmit={showModal}
              // onSubmit={dataSubmitHandler}
            >
              <Input
                placeholder="Title"
                maxLength={100}
                defaultValue={todo?.title}
              />
              <TextArea
                defaultValue={todo?.description}
                style={{ marginTop: "30px" }}
                rows={4}
                placeholder="description"
                maxLength={1000}
              />
              <DatePicker
                style={{ marginTop: "30px" }}
                onChange={onChange}
                placeholder="Due date"
                defaultValue={dayjs(todo.dueDate, "YYYY-MM-DD")}
                format={"YYYY-MM-DD"}
              />
              <br></br>
              <Select
                defaultValue={todo.status}
                style={{ width: 160, marginTop: "30px" }}
                onChange={handleChange}
                options={[
                  {
                    value: "OPEN",
                    label: "OPEN",
                  },
                  {
                    value: "WORKING",
                    label: "WORKING",
                  },
                  {
                    value: "DONE",
                    label: "DONE",
                  },
                  {
                    value: "OVERDUE",
                    label: "OVERDUE",
                  },
                ]}
              />
              <div style={styles.tagDivStyle}>
                <ul style={styles.tagUlStyle}>
                  {tags.map((tag, index) => {
                    return (
                      <li style={styles.tagLiStyle} key={index}>
                        {tag}
                        <span
                          style={{ paddingLeft: "10px", cursor: "pointer" }}
                          onClick={() => {
                            removeTag(index);
                          }}
                        >
                          <CloseOutlined />
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <input
                  style={styles.tagInput}
                  placeholder="add a tag.."
                  onKeyUp={addTags}
                />
              </div>
              <button style={styles.buttonStyleForAddTodo}>submit</button>
              <button
                style={styles.buttonStyleForAddTodoBack}
                onClick={() => navigate("/")}
              >
                back
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTodo;
