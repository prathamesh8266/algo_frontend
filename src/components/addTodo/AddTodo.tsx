import React, { useState } from "react";
import { styles } from "../../styles";
import { Input, DatePickerProps } from "antd";
import { DatePicker, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const onChange: DatePickerProps["onChange"] = (date, dateString) => {};

interface sendData {
  createdDate: string;
  title: string;
  description: string;
  dueDate: string;
  tags: string[];
  status: string;
}

const AddTodo = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

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
    if (values.title === "") {
      alert("please select a appropriate string title");
      return;
    }
    if (values.description === "") {
      alert("please select a appropriate description");
      return;
    }
    if (values.createdDate.localeCompare(values.dueDate) === 1) {
      alert("due date cannot be before date created");
      return;
    }
    try {
      const res = axios.post(
        "https://enhancedtodoapp-production.up.railway.app/todos",
        values
      );
      return navigate("/");
    } catch (e: any) {
      console.log(e);
      alert(e.message());
    }
  };

  const divStyle = {
    width: "60vw",
    margin: "auto",
    "@media (max-width: 500px)": {
      width: "90vw",
    },
  };

  const { TextArea } = Input;
  return (
    <div style={divStyle}>
      <h1 style={{ textAlign: "center", marginTop: "50px" }}>Add a new todo</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        <div>
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onSubmit={dataSubmitHandler}
          >
            <Input placeholder="Title" maxLength={100} />
            <TextArea
              style={{ marginTop: "30px" }}
              rows={4}
              placeholder="description"
              maxLength={1000}
            />
            <DatePicker
              style={{ marginTop: "30px" }}
              onChange={onChange}
              placeholder="Due date"
            />
            <br></br>
            <Select
              defaultValue="OPEN"
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
      </div>
    </div>
  );
};

export default AddTodo;
