console.log("hello typescirpt");

const num1 = document.getElementById("num1") as HTMLInputElement;
const num2 = document.getElementById("num2") as HTMLInputElement;
const addBtn = document.getElementById("addBtn") as HTMLButtonElement;

const addNumber = (num1: number, num2: number) => {
  return num1 + num2;
};

addBtn.onclick = () => {
  console.log(
    `${num1.value} + ${num2.value} = ${addNumber(+num1.value, +num2.value)}`
  );
};
