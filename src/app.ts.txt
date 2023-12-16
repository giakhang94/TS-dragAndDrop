//drag and drop project
//validate decorator
interface ValidateObject {
  [props: string]: {
    [validateProp: string]: string[];
  };
}
const validateObject: ValidateObject = {};
function Requireds(target: any, propname: string) {
  //target.constructor.name equal to the name of the class contain the property
  if (!validateObject[target.constructor.name]) {
    validateObject[target.constructor.name] = {
      ...validateObject[target.constructor.name],
      [propname]: ["required"],
    };
  } else {
    if (!validateObject[target.constructor.name][propname]) {
      validateObject[target.constructor.name][propname] = [];
    }
    validateObject[target.constructor.name][propname].push("required");
  }
}
function PositiveNumber(target: any, propname: string) {
  if (!validateObject[target.constructor.name]) {
    validateObject[target.constructor.name] = {
      ...validateObject[target.constructor.name],
      [propname]: ["positive"],
    };
  } else {
    if (!validateObject[target.constructor.name][propname]) {
      validateObject[target.constructor.name][propname] = [];
    }
    validateObject[target.constructor.name][propname].push("positive");
  }
}
function validator(obj: any) {
  //obj is an instance base on an specific class (exp claas A)
  //then obj.constructor.name is equal to A (name of the base class)
  console.log(validateObject);
  let result = true;
  for (const prop in validateObject[obj.constructor.name]) {
    // for(const validateProp of validateObject)
    for (const validateProp of validateObject[obj.constructor.name][prop]) {
      console.log(prop + " " + validateProp);
      switch (validateProp) {
        case "required":
          result = result && obj[prop].length !== 0;
          break;
        case "positive":
          result = result && +obj[prop] > 0;
      }
    }
  }
  return result;
}
//auto bind dercorator
function AutoBind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  console.log(descriptor);
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      console.log(descriptor);
      const originalFunction = descriptor.value;
      const boundFn = originalFunction.bind(this);
      return boundFn;
    },
  };
  return newDescriptor;
}

//done for decorators
//class for validate input value
class User {
  @Requireds
  title: string;
  @Requireds
  description: string;
  @PositiveNumber
  @Requireds
  people: number;
  constructor(t: string, dsc: string, pp: number) {
    this.title = t;
    this.description = dsc;
    this.people = pp;
  }
}
//class for input porject
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-input")!
    );
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importNode = document.importNode(this.templateElement.content, true);
    //this.templateElement.contet => get the content in order to the first argument is a Fragment Document (no parent element)

    this.element = importNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }
  //method for listner
  @AutoBind
  private submitHanlder(event: Event) {
    // console.log("submit handler this: ", this);
    //without bind(this) in configure
    //'this' of submithandler refer to to form element which triggers the sumbmit function
    event.preventDefault();
    const userInput = this.gatherUserInput();
    console.log(userInput);
  }
  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "0";
  }
  //add a listener for the form
  private configure() {
    //'this' keyword of configure() method refer to the ProjectInput class
    // console.log("configure this", this);
    this.element.addEventListener("submit", this.submitHanlder);
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
  private gatherUserInput(): [string, string, number] | void {
    const titleValue = this.titleInputElement.value;
    const descriptionValue = this.descriptionInputElement.value;
    const peopleValue = +this.peopleInputElement.value;
    let user1 = new User(titleValue, descriptionValue, peopleValue);
    console.log(validator(user1));
    if (validator(user1)) {
      this.clearInputs();
      return [titleValue, descriptionValue, peopleValue];
    } else {
      alert("invalid value, please try again");
      return;
    }
  }
}

const prjInput = new ProjectInput();
