import * as tf from "@tensorflow/tfjs";

interface TaskData {
    startDate: number;
    dueDate: number;
    duration: number;
    completed: boolean;
  }
  
  export const trainDeliveryPredictionModel = async (taskData: TaskData[]) => {
    const xs = taskData.map((data) => [
      data.startDate,
      data.dueDate,
      data.duration,
    ]);
    const ys = taskData.map((data) => (data.completed ? 0 : 1)); // 0 = on-time, 1 = delayed
  
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [3], activation: "relu" }));
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
  
    model.compile({ optimizer: "adam", loss: "binaryCrossentropy" });
  
    const xsTensor = tf.tensor2d(xs);
    const ysTensor = tf.tensor2d(ys, [ys.length, 1]);
  
    await model.fit(xsTensor, ysTensor, { epochs: 50 });
  
    return model;
  };
  
  export const predictTaskDelay = async (model: tf.LayersModel, taskInput: number[]) => {
    const prediction = model.predict(tf.tensor2d([taskInput]));
    if (Array.isArray(prediction)) {
        throw new Error("Prediction returned an array of tensors. Expected a single tensor.");
    }

    const predictionData = (prediction as tf.Tensor).dataSync();

    return predictionData[0] > 0.5 ? "Delayed" : "On-time";
  };