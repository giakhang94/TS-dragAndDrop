//drag and drop project
//==============================================
//end of the project - drag and drop feature
//Drag & drop interface
interface Dragable {
  dragStartHandler(event: DragEvent): void;
  dragEndHander(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHanlder(event: DragEvent): void;
}

//validate decorator
//code theo ông thầy
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number; //question mark allow undefined value
  max?: number;
}
function validator(validateInput: Validatable) {
  let isValid = true;
  if (validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length > 0;
  }
  if (validateInput.minLength) {
    if (typeof validateInput.value === "number") {
      isValid = isValid && true;
    } else {
      isValid =
        isValid &&
        validateInput.value.toString().trim().length >= validateInput.minLength;
    }
  }
  if (validateInput.maxLength) {
    if (typeof validateInput.value === "number") {
      isValid = isValid && true;
    } else {
      isValid =
        isValid &&
        validateInput.value.toString().trim().length <= validateInput.maxLength;
    }
  }
  if (validateInput.max) {
    if (typeof validateInput.value !== "number") {
      console.log("can apply maximum value for NaN value");
    } else {
      isValid = isValid && validateInput.value <= validateInput.max;
    }
  }
  if (validateInput.min) {
    if (typeof validateInput.value !== "number") {
      console.log("can apply minimum value for NaN value");
    } else {
      isValid = isValid && validateInput.value >= validateInput.min;
    }
  }
  return isValid;
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

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }
  abstract configure(): void;
  abstract renderContent(): void;
  //pause here at 8:00 in the section 131 - adding Inheritance and Generics

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

//project list class
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];
  constructor(private type: ProjectStatus) {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }
  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEL = this.element.querySelector("ul")!;
      listEL.classList.add("droppable");
    }
  }
  @AutoBind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData("text/plain");
    console.log(event);

    console.log(this); //refer to the UL list which trigger the method
    //nên là drop ở chỗ nào thì chỗ đó triiger dropHandler
    //drop chỗ nào thì this refer về element đó
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }
  @AutoBind
  dragLeaveHanlder(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      //==============before creating project item class
      // const listItem = document.createElement("li");
      // listItem.textContent = prjItem.title;
      // listEl?.appendChild(listItem);
      //==============after creating project item class
      // console.log("tao ne may ", this.element.querySelector("ul")!.id); //active-projects-list (for defalut)
      // new ProjectItem(`${this.type}-projects-list`, prjItem); //other way to put all items in UL tag
      new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
    }
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHanlder);
    this.element.addEventListener("drop", this.dropHandler);
    projectState.addListener((projects: any[]) => {
      console.log("re-render console.log", projects);
      // console.log("this", this); //refer to ProjectList class
      const releativeProjects = projects.filter((project: Project) => {
        if (this.type === ProjectStatus.Active) {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = releativeProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}
//Project Item Class
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Dragable
{
  private project: Project;
  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }
  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.renderContent(); //don't forget to call this renderContent() method
    this.configure();
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }
  dragEndHander(event: DragEvent): void {
    console.log("drag end event: ", event);
  }
  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHander);
  }
  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("p")!.textContent = this.project.description;
    this.element.querySelector("h3")!.textContent = this.persons + "assigned";
  }
}
//Project Type
enum ProjectStatus {
  "Active" = "active",
  "Finished" = "finished",
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
//listner type
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addListenr(lisenterFn: Listener<T>) {
    this.listeners.push(lisenterFn);
  }
}
//Project state management
class ProjectState extends State<Project> {
  // private listeners: Listener[] = []; //a list of funtions that wiLl be called when something changes
  private projects: Project[] = [];
  static instance: ProjectState;
  private constructor() {
    super();
  }
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners();
  }
  addListener(listenerFn: Listener<Project>) {
    console.log("listenerFn", listenerFn);
    this.listeners.push(listenerFn);
  }
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
  private updateListeners() {
    for (const listenFn of this.listeners) {
      // console.log(this.projects.slice());
      listenFn(this.projects.slice());
    }
  }
}

//global projectState
const projectState = ProjectState.getInstance();
//class for input porject
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    super("project-input", "app", true, "user-input");
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
  }
  //method for listner
  @AutoBind
  private submitHanlder(event: Event) {
    // console.log("submit handler this: ", this);
    //without bind(this) in configure
    //'this' of submithandler refer to to form element which triggers the sumbmit function
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      // console.log(title, description, people); it works
      projectState.addProject(title, description, people);
      this.clearInputs();
    }
  }
  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "0";
  }
  //add a listener for the form
  configure() {
    //'this' keyword of configure() method refer to the ProjectInput class
    // console.log("configure this", this);
    this.element.addEventListener("submit", this.submitHanlder);
  }
  renderContent(): void {}
  private gatherUserInput(): [string, string, number] | void {
    const titleValue = this.titleInputElement.value;
    const descriptionValue = this.descriptionInputElement.value;
    const peopleValue = +this.peopleInputElement.value;
    let validateTitle = { value: titleValue, required: true, minLength: 5 };
    let validateDescription = {
      value: descriptionValue,
      required: true,
      minLength: 5,
    };
    let validatePeople = { value: peopleValue, required: true, min: 2, max: 9 };
    if (
      !validator(validateDescription) ||
      !validator(validatePeople) ||
      !validator(validateTitle)
    ) {
      alert("invalid input value(s), please try again");
    } else {
      console.log([titleValue, descriptionValue, peopleValue]);
      return [titleValue, descriptionValue, peopleValue];
    }
  }
}

const prjInput = new ProjectInput();
const prjListActive = new ProjectList(ProjectStatus.Active);
const prjListFinished = new ProjectList(ProjectStatus.Finished);
