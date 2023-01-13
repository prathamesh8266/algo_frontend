import React, { useEffect, useState } from "react";
import { Table } from "antd";
import axios from "axios";
import { DbDataType } from "./Table";
import { Modal, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { styles } from "../../styles";

const getRequest = async (param: string) => {
  try {
    const res = await axios.get<any>(
      "https://enhancedtodoapp-production.up.railway.app/todos?q=" + param
    );
    const todos: DbDataType[] = res.data;
    return todos;
  } catch (err) {
    console.log(err);
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<DbDataType[]>([]);
  const [search, setSearch] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  const removeDuplicate = (tags: string[]) => {
    let arr: string[] = [];
    for (let i = 0; i < tags.length; i++) {
      let add_tag: boolean = true;
      for (let j = i + 1; j < tags.length; j++) {
        if (tags[i].localeCompare(tags[j]) === 0) {
          add_tag = false;
        }
      }
      if (add_tag) {
        arr.push(tags[i]);
      }
    }
    return arr;
  };

  useEffect(() => {
    getRequest("").then((todos_map) => {
      setTodos([]);
      setTags([]);
      let arr: string[] = [];
      todos_map?.map((todo) => {
        arr.push(...todo.tags);
        setTags((t) => [...t, ...todo.tags]);
        setTodos((t) => [...t, todo]);
      });
      setTags(removeDuplicate(arr));
    });
  }, []);

  // modal related logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTitles, setDeleteTitles] = useState<number>();
  const showModal = (id: number, title: string) => {
    setIsModalOpen(true);
    setDeleteTitles(id);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    deleteHandler(deleteTitles);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  //////////////////////

  // search based logic
  const searchHandler = (e: any) => {
    e.preventDefault();
    getRequest(e.target[0].value).then((todos_map) => {
      setTodos([]);
      todos_map?.map((todo) => setTodos((t) => [...t, todo]));
    });
  };
  //////////////////////

  const trigerDelete = async (id: number) => {
    const res = await axios.delete(
      `https://enhancedtodoapp-production.up.railway.app/todos/${id}`
    );
  };

  const deleteHandler = async (id: number | undefined) => {
    if (id === undefined) {
      alert("something went wrong, try again");
      return;
    }
    try {
      trigerDelete(id).then(() => {
        getRequest("").then((todos_map) => {
          setTodos([]);
          todos_map?.map((todo) => setTodos((t) => [...t, todo]));
        });
      });
    } catch (e: any) {
      alert(e);
    }
    return <p></p>;
  };

  const navigateToEdit = (id: number) => {
    return navigate(`/edit/${id}`);
  };

  const tableColumns: ColumnsType<any> = [
    {
      title: "Date Created",
      dataIndex: "createdDate",
      key: "date_created",
      sorter: (a, b) => a.createdDate.localeCompare(b.createdDate),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "date_due",
      sorter: (a, b) => a.dueDate.localeCompare(b.dueDate),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      filters: tags.map((tag, index) => {
        return { text: tag, value: tag };
      }),
      filterSearch: true,
      onFilter: (value, record) => record.tags.includes(value),
      render: (_, { tags }) => (
        <>
          {tags.map((tag: string, index: number) => {
            let color = "geekblue";
            return (
              <Tag color={color} key={index}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        {
          text: "OPEN",
          value: "OPEN",
        },
        {
          text: "WORKING",
          value: "WORKING",
        },
        {
          text: "DONE",
          value: "DONE",
        },
        {
          text: "OVERDUE",
          value: "OVERDUE",
        },
      ],
      filterSearch: true,
      onFilter: (value, record) => {
        return record.status.includes(value);
      },
      render: (_, { status }) => (
        <>
          {status === "OPEN" ? (
            <p style={{ color: "blue" }}>{status}</p>
          ) : status === "WORKING" ? (
            <p style={{ color: "#f5a142" }}>{status}</p>
          ) : status === "DONE" ? (
            <p style={{ color: "green" }}>{status}</p>
          ) : status === "OVERDUE" ? (
            <p style={{ color: "red" }}>{status}</p>
          ) : (
            ""
          )}
        </>
      ),
    },
    {
      title: "Delete",
      key: "delete",
      render: (text) => (
        <a
          style={{ color: "red" }}
          onClick={() => {
            showModal(text.id, text.title);
          }}
        >
          Delete
        </a>
      ),
    },
    {
      title: "Edit",
      key: "edit",
      render: (text) => (
        <a style={{ color: "green" }} onClick={() => navigateToEdit(text.id)}>
          Edit
        </a>
      ),
    },
  ];

  return (
    <div style={{ height: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>
      <div style={{ display: "flex", padding: "10px" }}>
        <form style={{ marginRight: "10px" }} onSubmit={searchHandler}>
          <input
            style={styles.inputStyleDashboard}
            placeholder="Search by keyword.."
          />
          <button style={styles.buttonStyle} type="submit">
            search
          </button>
        </form>
        <button style={styles.buttonStyle} onClick={() => navigate("/add")}>
          Add
        </button>
      </div>
      <div style={{ overflowX: "scroll" }}>
        <Table
          style={{ padding: "10px" }}
          columns={tableColumns}
          dataSource={todos}
        />
      </div>
      <Modal
        title="Confirm delete"
        open={isModalOpen}
        onOk={() => handleOk()}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to delete ?</p>
      </Modal>
    </div>
  );
};

export default Dashboard;
