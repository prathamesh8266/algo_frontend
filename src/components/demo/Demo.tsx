import React, { useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProTable, { ProColumns } from "@ant-design/pro-table";
import { Modal, Tag } from "antd";
import { styles } from "../../styles";

export interface TableListItem {
  id: number;
  createdDate: string;
  title: string;
  description: string;
  dueDate: string;
  tags: string[];
  status: string;
}

const getRequest = async (param: string) => {
  try {
    const res = await axios.get<any>(
      "https://enhancedtodoapp-production.up.railway.app/todos?q=" + param
    );
    const todos: TableListItem[] = res.data;
    return todos;
  } catch (err) {
    console.log(err);
  }
};

export default () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<TableListItem[]>([]);
  const [showTodos, setShowTodos] = useState<TableListItem[]>([]);
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
    setLoading(true);
    getRequest("").then((todos_map) => {
      setTodos([]);
      setShowTodos([]);
      setTags([]);
      let arr: string[] = [];
      todos_map?.map((todo) => {
        arr.push(...todo.tags);
      });
      setTodos(todos_map!);
      setShowTodos(todos_map!);
      setTags(removeDuplicate(arr));
    });
    setLoading(false);
  }, []);

  // modal related logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTitles, setDeleteTitles] = useState<number>();

  const showModal = (id: any) => {
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
          setShowTodos([]);
          setTodos(todos_map!);
          setShowTodos(todos_map!);
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

  const tableColumns: ProColumns<TableListItem>[] = [
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
      onFilter: (value, record) => record.tags.includes(value.toString()),
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
        return record.status.includes(value.toString());
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
      render: (obj) => {
        if (obj == undefined) return <a></a>;
        let id = JSON.parse(JSON.stringify(obj)).id;
        return (
          <a
            style={{ color: "red" }}
            onClick={() => {
              showModal(id);
            }}
          >
            Delete
          </a>
        );
      },
    },
    {
      title: "Edit",
      key: "edit",
      render: (obj) => {
        if (obj == undefined) return <a></a>;
        let id = JSON.parse(JSON.stringify(obj)).id;
        return (
          <a style={{ color: "green" }} onClick={() => navigateToEdit(id)}>
            Edit
          </a>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(true);

  const searchIntegs = (tags: string[], key: string) => {
    let bol = false;
    tags.forEach((e) => {
      if (e.includes(key)) bol = true;
    });
    return bol;
  };

  const searchHandler = (e: any) => {
    e.preventDefault();
    let val = e.target.value.trim();
    const ar = todos.filter((f) => {
      if (
        f.createdDate.includes(val) ||
        f.dueDate.includes(val) ||
        f.title.includes(val) ||
        searchIntegs(f.tags, val) ||
        f.description.includes(val) ||
        f.status.toLowerCase().includes(val)
      ) {
        return f;
      }
    });
    setShowTodos(ar);
  };

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>
      <div style={{ display: "flex", padding: "10px" }}>
        <input
          style={styles.inputStyleDashboard}
          placeholder="Search by keyword.."
          onChange={searchHandler}
        />
        <button style={styles.buttonStyle} onClick={() => navigate("/add")}>
          Add Todo
        </button>
      </div>
      <ConfigProvider locale={enUS}>
        <ProTable<TableListItem>
          search={false}
          columns={tableColumns}
          scroll={{ x: "max-content" }}
          rowKey="key"
          pagination={{
            showSizeChanger: true,
          }}
          tableRender={(_, dom) => (
            <div
              style={{
                display: "flex",
                width: "100%",
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                {dom}
              </div>
            </div>
          )}
          loading={loading}
          dataSource={showTodos}
          options={{
            density: true,
            reload: () => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            },
            fullScreen: true,
            setting: true,
          }}
          dateFormatter="string"
        />
      </ConfigProvider>
      <Modal
        title="Confirm delete"
        open={isModalOpen}
        onOk={() => handleOk()}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to delete ?</p>
      </Modal>
    </>
  );
};
