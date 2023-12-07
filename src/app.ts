//====================DECORATORS===============
console.log("Decorators");
//add a function after create the class
//decorators
function Logger(constructor: Function) {
  console.log("loggin...");
  console.log("constructor from logger: ", constructor);
  console.log("=======================");
}
function Logger2(logString: string) {
  //decorator factory (là cái hàm trong return)
  return function (constructor: Function) {
    console.log("other ways: ", constructor);
    console.log("====================");
  };
}
//building more useful decorator factories
//the decorator can receive some arguments,
//and these arguments will be used in the factory function
function MoreClassReturn() {
  return function <T extends { new (...arg: any[]): { name: string } }>(
    constructorOri: T
  ) {
    return class extends constructorOri {
      tao2 = "Phuong";
      constructor(...arg: any[]) {
        super();
        this.name = "Heo Phuong";
      }
    };
  };
}
function WithTemplate(template: string, hookId: string) {
  //factory
  return function <T extends { new (...arg: any[]): { name: string } }>(
    constructorOriginal: T
  ) {
    //chưa hiểu lắm, nhưng phải thêm generic như trên mới hết lỗi
    // console.log("constructer original", constructorOriginal);
    return class extends constructorOriginal {
      tao: string;
      constructor(...arg: any[]) {
        super(); //call super here => save the original function, original class
        this.tao = "khang";
        // console.log("arg", arg);
        //use arguments from decorator
        // const p = new constructorOriginal(); //bỏ cái này khi nào tạo instance decorator mới execute
        console.log("constructorOriginal obj", this);
        const hookElement = document.getElementById(hookId);
        if (hookElement) {
          hookElement.innerHTML = template;
          hookElement.querySelector("h2")!.textContent = this.name;
        }
      }
    };
  };
  //prop value of the class can be gotten through the constructor
  // let p = new constructor() => name: p.name, other: p.other
  //also for methods as well, print(){console.log('print....')} --> p.print()
}
//only this class, there's no decorators
@Logger
@Logger2("LOGGING - PERSON")
@WithTemplate("<h2>Test with template factory </h2>", "app-template-factory")
@MoreClassReturn()
class Person {
  name = "Max";
  // constructor() {
  //   console.log("Creating person object...");
  // }
  print(): void {
    console.log("printing...");
  }
}
let person = new Person();
console.log(person);
// console.log("==========================");
//for note
//create a function before creating a class
//decorator function get few arguments
//the first argument refer to the constructor of the class which use this decorator funciton
//use @ symbol to declare a decorator
//other way
//ruturn another function, @Logger()
//use Captial first letter for the function's name
//cái nào để gần class hơn sẽ chạy trước

//------------- Properties decorator---------------
//property decorator
function Log(target: any, propertyName: string | Symbol) {
  console.log("properties decorator");
  console.log(target, propertyName);
  console.log("====================");
}
//accessor and parameter decorator
function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
  console.log("accessor decorator");
  console.log(target);
  console.log(name);
  console.log(descriptor);
  console.log("==============");
}
function Log3(target: any, name: string, descriptor: PropertyDescriptor) {
  console.log("methods decorator");
  console.log(target);
  console.log(name);
  console.log(descriptor);
  console.log("==============");
}
function Log4(target: any, name: string, position: number) {
  console.log("parameter decorator");
  console.log(target);
  console.log(name); //name of the method use this parameter, not the parameters
  console.log(position);
  console.log("==============");
}

class Product {
  @Log //props decorator: khai báo ở trong class, cùng cấp với các prop
  title: string;
  _price: number;
  @Log2
  set price(value: number) {
    if (value > 0) {
      this._price = value;
    } else {
      throw new Error("price must be a postivie number");
    }
  }
  constructor(t: string, p: number) {
    this.title = t;
    this._price = p;
  }
  @Log3
  getPriceWithTax(@Log4 tax: number) {
    return this._price * (1 + tax);
  }
}

//===================Auto bind decorator=================
console.log("auto bind decorator");
//auto bind function
function PrintMessage(
  target: any,
  name: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      console.log(this); //Printer class
      const boundFn = originalMethod.bind(this);
      console.log("boundFn", boundFn);
      return boundFn;
    },
  };
  console.log("adjusted: ", adjustedDescriptor);
  return adjustedDescriptor;
}
//test descriptor
function tao(target: any, _2: any, descriptor: PropertyDescriptor) {
  console.log("new descriptor: ", descriptor);
  console.log("new target", target);
}

class Printer {
  message = "this works!";
  @tao
  @PrintMessage
  showMessage() {
    console.log(this.message);
  }
}

let p = new Printer();

const button = document.querySelector("button")!;
// button.addEventListener("click", () => {
//   console.log("this ponit to eventListner: ", this?.event?.target?.textContent);
// });
//this will point to the eventListener (not to the p instance)
//to fix this issue, use bind()
button.addEventListener("click", p.showMessage);
console.log("==============================");
//==================validate with decorator============
interface ValidatorConfig {
  [property: string]: {
    [ValidatableProp: string]: string[]; //['requried', 'positive']
  };
}

const resigerValidators: ValidatorConfig = {};

function RequiredField(target: any, propName: string) {
  resigerValidators[target.constructor.name] = {
    ...resigerValidators[target.constructor.name],
    [propName]: ["required"],
  };
}
function PositiveNumber(target: any, propName: string) {
  resigerValidators[target.constructor.name] = {
    ...resigerValidators[target.constructor.name],
    [propName]: ["positive"],
  };
}
function validate(obj: any) {
  let result = true;
  const objValidatorConfig = resigerValidators[obj.constructor.name];
  console.log(resigerValidators);
  if (!objValidatorConfig) {
    return true;
  }
  for (const prop in objValidatorConfig) {
    for (const validator of objValidatorConfig[prop]) {
      switch (validator) {
        case "required":
          console.log(obj[prop]);
          if (obj[prop] === "") {
            result = false;
          }
          break;
        case "positive":
          result = result && obj[prop] > 0;
          break;
      }
    }
  }
  console.log(result);
  return result;
}
console.log("validate decorator");
class Course2 {
  @RequiredField
  title: string;
  @PositiveNumber
  price: number;
  constructor(t: string, p: number) {
    this.price = p;
    this.title = t;
  }
}

const courseForm = document.querySelector("form")!;
courseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const titleEl = document.getElementById("title") as HTMLInputElement;
  const priceEl = document.getElementById("price") as HTMLInputElement;

  const title = titleEl.value;
  const price = +priceEl.value;
  const createdCourse = new Course2(title, price);
  if (!validate(createdCourse)) {
    alert("invalid input, please try again");
  } else {
    console.log(createdCourse);
  }
});

//test nháp
console.log("==================");
console.log("test nhap");
