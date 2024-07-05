import React, { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Panel,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  updateEdge,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
  NodeToolbar,
  NodeResizer,
  NodeResizeControl,
} from "reactflow";
import ContextMenu from "./ContextMenu";
import { toPng } from "html-to-image";
import "reactflow/dist/style.css";
import { BiSolidDockLeft } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";
import { useGlobalContext } from "./context"; 
// import TextUpdaterNode from './TextUpdaterNode.js';
// import './text-updater-node.css';

// const nodeTypes = { textUpdater: TextUpdaterNode };

const initialNodes = [
  {
    id: "1",
    // type: "textUpdater",
    position: { x: 500, y: 100 },
    data: { label: "Double click to open context menu" },
    style: {
      background: "#98FB98",
    },
  },
  {
    id: "2",
    type: "textUpdater",
    position: { x: 500, y: 200 },
    data: { label: "Click to update" },
    style: {
      background: "#cfafee",
    },
  },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];



const imageWidth = 1024;
const imageHeight = 768;

const Content = () => {
  const { isSidebarOpen, closeSidebar } = useGlobalContext();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState();
  const [nodeId, setNodeId] = useState();
  const [nodeColor, setNodeColor] = useState("#ffffff");
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const edgeUpdateSuccessful = useRef(true);
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  const [newNodeInput, setNewNodeInput] = useState({
    id: "",
    name: "",
    color: "#ffffff",
  });
  const { setViewport } = useReactFlow();
  const { getNodes } = useReactFlow();
  const onClick = () => {
    
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "#000000",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [id, setId] = useState(0);

  const getId = useCallback(() => {
    setId((prevId) => prevId + 1);
    return `node_${id}`;
  }, [id]);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY - 60,
        left:
          event.clientX < pane.width - 200 &&
          (isSidebarOpen ? event.clientX - 300 : event.clientX),
        right:
          event.clientX >= pane.width - 200 &&
          pane.width - (isSidebarOpen ? event.clientX - 300 : event.clientX),
        bottom:
          event.clientY >= pane.height - 200 &&
          pane.height - event.clientY + 70,
      });
    },
    [setMenu, isSidebarOpen]
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedElements([node]);
    setNodeName(node.data.label);
    setNodeId(node.id);
    setNodeColor(node.style.background);
  }, []);
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      edgeUpdateSuccessful.current = true;
      setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onEdgeUpdateEnd = useCallback(
    (_, edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }

      edgeUpdateSuccessful.current = true;
    },
    [setEdges]
  );

  const handleCreateNode = () => {
    const newNode = {
      id: newNodeInput.id.length > 0 ? newNodeInput.id : getId(),
      position: { x: 400, y: 50 }, // You can set the initial position as needed
      data: {
        label:
          newNodeInput.name.length > 0 ? newNodeInput.name : "Default Name",
      },
      style: {
        background:
          newNodeInput.color.length > 0 ? newNodeInput.color : nodeColor, // Default color
      },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setNewNodeInput({ id: "", name: "", color: "#ffffff" });
  };
  useEffect(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElements[0]?.id) {
            node.data = {
              ...node.data,
              label: nodeName,
            };
            node.style = {
              ...node.style,
              background: nodeColor,
            };
          }
          return node;
        })
      );
    } else {
      setNodeName(""); // Clear nodeName when no node is selected
      setNodeColor("#ffffff");
    }
  }, [nodeName, nodeColor, selectedElements, setNodes]);

  const handleUpdateNode = (event) => {
    const { name, value } = event.target;

    // Update the corresponding state based on the input name

    if (name === "name") setNodeName(value);
    else if (name === "background") setNodeColor(value.background);

    // Find the selected node and update its data
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: { ...n.data, [name]: value },
              style: {
                ...n.style,
                [name]: value,
              },
            }
          : n
      )
    );
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
        style: {
          background: "#ffffff",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, getId, setNodes]
  );

  const flowKey = "example-flow";
  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport, setEdges]);

  return (
    <ReactFlow
      ref={ref}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onInit={setReactFlowInstance}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onEdgeUpdate={onEdgeUpdate}
      onEdgeUpdateStart={onEdgeUpdateStart}
      onEdgeUpdateEnd={onEdgeUpdateEnd}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
    >
      {/* sidebar */}
      <div
        className={`transition-all  duration-500  fixed top-0 ${
          isSidebarOpen ? "left-0" : "-left-64"
        }`}
      >
        <div className="relative flex flex-col w-64 h-screen min-h-screen px-4 py-8 overflow-y-auto bg-white border-r">
          <div className="">
            <button
              onClick={closeSidebar}
              className="absolute flex items-center justify-center w-8 h-8 ml-6 text-gray-600 rounded-full top-1 right-1 active:bg-gray-300 focus:outline-none hover:bg-gray-200 hover:text-gray-800"
            >
              {/* <HiX className="w-5 h-5" /> */}
              <BiSolidDockLeft className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-semibold text-gray-700 ">
              Mind <span className="-ml-1 text-pink-500 ">MAP</span>
            </h2>
          </div>
          <hr className="my-0 mt-[0.20rem]" />
          <div className="flex flex-col justify-between flex-1 mt-3">
            <div className="flex flex-col justify-start space-y-5 h-[calc(100vh-135px)]">
              {/* Create Node Section */}
              <div className="flex flex-col space-y-3 ">
                <div className="mt-3 text-lg font-bold text-black">
                  Create Node
                </div>
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="p-[1px] border pl-1 "
                    onChange={(e) =>
                      setNewNodeInput((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    value={newNodeInput.name}
                  />
                  <div className="flex flex-row gap-x-2">
                    <label className="font-semibold ">Color:</label>
                    <input
                      type="color"
                      placeholder="Color"
                      className="p-[1px] border pl-1"
                      onChange={(e) =>
                        setNewNodeInput((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      value={newNodeInput.color}
                    />
                  </div>
                  <button
                    className="p-[4px]  text-white bg-slate-700 hover:bg-slate-800 active:bg-slate-900 rounded"
                    onClick={handleCreateNode}
                  >
                    Create
                  </button>
                </div>
              </div>
              <hr className="my-2" />
              {/* Update Node Section */}
              <div className="flex flex-col space-y-3">
                <div className="text-lg font-bold text-black">Update Node</div>
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={nodeName}
                    onChange={handleUpdateNode}
                    className="p-[1px] border pl-1 "
                  />
                  <div className="flex flex-row gap-x-5">
                    <div className="flex flex-row gap-x-2">
                      <label className="font-semibold ">Color:</label>
                      <input
                        type="color"
                        placeholder="bgColor"
                        name="background"
                        value={nodeColor}
                        onChange={handleUpdateNode}
                        className="p-[1px] border pl-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <hr className="my-0" />
              {/* Drag and Drop Section */}
              <div className="flex flex-col space-y-3">
                <div className="text-lg font-bold text-black">
                  Drag and Drop
                </div>
                <div className="flex flex-col p-1 space-y-3 rounded outline outline-2">
                  <div
                    className="font-medium text-center rounded cursor-grab"
                    onDragStart={(event) => onDragStart(event, "default")}
                    draggable
                  >
                    Default Node
                  </div>
                </div>
              </div>
              <hr className="my-0" />
              {/* Save and Restore Buttons */}
              <div className="flex flex-col space-y-3">
                <div className="text-lg font-bold text-black">Controls</div>
                <div className="flex flex-row space-x-3">
                  <button
                    className="flex-1 p-2 text-sm text-white transition duration-300 ease-in-out rounded bg-slate-700 hover:bg-slate-800 active:bg-slate-900"
                    onClick={onSave}
                  >
                    Save
                  </button>
                  <button
                    className="flex-1 p-2 text-sm text-white rounded bg-slate-700 hover:bg-slate-800 active:bg-slate-900"
                    onClick={onRestore}
                  >
                    Restore{" "}
                  </button>
                  <button
                    className="flex-1 p-2 text-sm text-white rounded bg-slate-700 hover:bg-slate-800 active:bg-slate-900"
                    onClick={onClick}
                  >
                    Download{" "}
                  </button>
                </div>
              </div>
              <hr className="my-0" />
              <div className="flex justify-center px-4 pb-2 mt-auto -mx-4 bottom-3">
                <h4 className=" text-[12px] font-semibold text-gray-600 ">
                  Made with <FaHeart className="inline-block" /> 😄 by{" "} 
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.linkedin.com/in/vinit-kumar-98b542226/"
                    className="cursor-pointer hover:underline hover:text-blue-500"
                  >
                    Vinit Kumar.
                  </a>
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Controls />
      <MiniMap zoomable pannable />
      <Background variant="dots" gap={12} size={1} />
      {/* context menu */}
      <Panel />
      <NodeToolbar/>
      <NodeResizer/>
      <NodeResizeControl/>
      {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
    </ReactFlow>
  );
};


function downloadImage(dataUrl) {
  const a = document.createElement("a");

  a.setAttribute("download", "flowchart.png");
  a.setAttribute("href", dataUrl);
  a.click();
}

const ReactFlowProviderContent = () => {
  const { isSidebarOpen } = useGlobalContext();
  return (
    <ReactFlowProvider>
      <div
        className={`h-[calc(100vh-74px)] flex flex-col  ${
          isSidebarOpen ? "ml-64" : ""
        }`}
      >
        <Content />
      </div>
    </ReactFlowProvider>
  );
};
export default ReactFlowProviderContent;
