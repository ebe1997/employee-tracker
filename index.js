const util = require("util");
const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

const DB = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "G3n3t1cs_",
  database: "employees_db",
  insecureAuth: true,
  port: 3306,
});

DB.query = util.promisify(DB.query);

let showPrompt = async () => {
  const prompt = [
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        {
          name: "View All Employees",
          value: "VIEW_ALL_EMPLOYEES",
        },
        {
          name: "View All Employees By Department",
          value: "VIEW_ALL_EMPLOYEES_BY_DEPARTMENT",
        },
        {
          name: "View All Employees By Manager",
          value: "VIEW_ALL_EMPLOYEES_BY_MANAGER",
        },
        {
          name: "Add Employee",
          value: "ADD_EMPLOYEE",
        },
        {
          name: "Remove Employee",
          value: "REMOVE_EMPLOYEE",
        },
        {
          name: "Update Employee Role",
          value: "UPDATE_EMPLOYEE_ROLE",
        },
        {
          name: "Update Employee Manager",
          value: "UPDATE_EMPLOYEE_MANAGER",
        },
        {
          name: "View All Roles",
          value: "VIEW_ALL_ROLES",
        },
        {
          name: "Add Role",
          value: "ADD_ROLE",
        },
        {
          name: "Remove Role",
          value: "REMOVE_ROLE",
        },
        {
          name: "View All Departments",
          value: "VIEW_ALL_DEPARTMENTS",
        },
        {
          name: "Add Department",
          value: "ADD_DEPARTMENT",
        },
        {
          name: "Remove Department",
          value: "REMOVE_DEPARTMENT",
        },
        {
          name: "View Total Utilized Budget",
          value: "VIEW_TOTAL_UTILIZED_BUDGET",
        },
        {
          name: "Quit",
          value: "QUIT",
        },
      ],
    },
  ];

  const answer = await inquirer.prompt(prompt);
  switch (answer.choice) {
    case "VIEW_ALL_EMPLOYEES":
      viewAllEmployees();
      break;
    case "VIEW_ALL_EMPLOYEES_BY_DEPARTMENT":
      viewAllEmployeesByDepartment();
      break;
    case "VIEW_ALL_EMPLOYEES_BY_MANAGER":
      viewAllEmployeesByManager();
      break;
    case "ADD_EMPLOYEE":
      addEmployee();
      break;
    case "REMOVE_EMPLOYEE":
      removeEmployee();
      break;
    case "UPDATE_EMPLOYEE_ROLE":
      updateEmployeeRole();
      break;
    case "UPDATE_EMPLOYEE_MANAGER":
      updateEmployeeManager();
      break;
    case "VIEW_ALL_ROLES":
      viewAllRoles();
      break;
    case "ADD_ROLE":
      addRole();
      break;
    case "REMOVE_ROLE":
      removeRole();
      break;
    case "VIEW_ALL_DEPARTMENTS":
      viewAllDepartments();
      break;
    case "ADD_DEPARTMENT":
      addDepartment();
      break;
    case "REMOVE_DEPARTMENT":
      removeDepartment();
      break;
    case "VIEW_TOTAL_UTILIZED_BUDGET":
      viewTotalUtilizedBudget();
      break;
    default:
      quit();
      break;
  }
};

let viewAllEmployees = async () => {
  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
  );
  console.log("\n");
  console.table(employees);
  showPrompt();
};

let viewAllEmployeesByDepartment = async () => {
  const departments = await DB.query(
    "SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM department LEFT JOIN role ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id GROUP BY department.id, department.name"
  );

  const departmentOptions = departments.map(({ id, name }) => ({
    name: name,
    value: id,
  }));
  const { departmentId } = await inquirer.prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you like to see employees for?",
      choices: departmentOptions,
    },
  ]);

  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department department on role.department_id = department.id WHERE department.id = ?;",
    departmentId
  );

  console.log("\n");
  console.table(employees);
  showPrompt();
};

let viewAllEmployeesByManager = async () => {
  const managers = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
  );

  const managerOptions = managers.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { managerId } = await inquirer.prompt([
    {
      type: "list",
      name: "managerId",
      message: "Which employee do you want to see direct reports for?",
      choices: managerOptions,
    },
  ]);

  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, department.name AS department, role.title FROM employee LEFT JOIN role on role.id = employee.role_id LEFT JOIN department ON department.id = role.department_id WHERE manager_id = ?;",
    managerId
  );
  console.log("\n");

  if (employees.length === 0) {
    console.log("The selected employee has no direct reports");
  } else {
    console.table(employees);
  }

  showPrompt();
};

let addEmployee = async () => {
  const roles = await DB.query(
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
  );
  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
  );

  const employee = await inquirer.prompt([
    {
      name: "first_name",
      message: "What is the employee's first name?",
    },
    {
      name: "last_name",
      message: "What is the employee's last name?",
    },
  ]);

  const roleOptions = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { roleId } = await inquirer.prompt({
    type: "list",
    name: "roleId",
    message: "What is the employee's role?",
    choices: roleOptions,
  });

  employee.role_id = roleId;

  const managerOptions = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  managerOptions.unshift({ name: "None", value: null });

  const { managerId } = await inquirer.prompt({
    type: "list",
    name: "managerId",
    message: "Who is the employee's manager?",
    choices: managerOptions,
  });

  employee.manager_id = managerId;

  await DB.query("INSERT INTO employee SET ?", employee);

  console.log(
    `Added ${employee.first_name} ${employee.last_name} to the database`
  );

  showPrompt();
};

let removeEmployee = async () => {
  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
  );

  const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { employeeId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee do you want to remove?",
      choices: employeeOptions,
    },
  ]);

  await DB.query("DELETE FROM employee WHERE id = ?", employeeId);

  console.log("Removed employee from the database");

  showPrompt();
};

let updateEmployeeRole = async () => {
  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
  );

  const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { employeeId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeOptions,
    },
  ]);

  const roles = await DB.query(
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
  );

  const roleOptions = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { roleId } = await inquirer.prompt([
    {
      type: "list",
      name: "roleId",
      message: "Which role do you want to assign the selected employee?",
      choices: roleOptions,
    },
  ]);

  await DB.query("UPDATE employee SET role_id = ? WHERE id = ?", [
    roleId,
    employeeId,
  ]);

  console.log("Updated employee's role");

  showPrompt();
};

let updateEmployeeManager = async () => {
  const employees = await DB.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
  );

  const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { employeeId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's manager do you want to update?",
      choices: employeeOptions,
    },
  ]);

  const managers = await DB.query(
    "SELECT id, first_name, last_name FROM employee WHERE id != ?",
    employeeId
  );

  const managerOptions = managers.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { managerId } = await inquirer.prompt([
    {
      type: "list",
      name: "managerId",
      message:
        "Which employee do you want to set as manager for the selected employee?",
      choices: managerOptions,
    },
  ]);

  await DB.query("UPDATE employee SET manager_id = ? WHERE id = ?", [
    managerId,
    employeeId,
  ]);

  console.log("Updated employee's manager");

  showPrompt();
};

let viewAllRoles = async () => {
  const roles = await DB.query(
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
  );

  console.log("\n");
  console.table(roles);

  showPrompt();
};

let addRole = async () => {
  const departments = await DB.query(
    "SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM department LEFT JOIN role ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id GROUP BY department.id, department.name"
  );

  const departmentOptions = departments.map(({ id, name }) => ({
    name: name,
    value: id,
  }));

  const role = await inquirer.prompt([
    {
      name: "title",
      message: "What is the name of the role?",
    },
    {
      name: "salary",
      message: "What is the salary of the role?",
    },
    {
      type: "list",
      name: "department_id",
      message: "Which department does the role belong to?",
      choices: departmentOptions,
    },
  ]);

  await DB.query("INSERT INTO role SET ?", role);

  console.log(`Added ${role.title} to the database`);

  showPrompt();
};

let removeRole = async () => {
  const roles = await DB.query(
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
  );

  const roleOptions = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { roleId } = await inquirer.prompt([
    {
      type: "list",
      name: "roleId",
      message:
        "Which role do you want to remove? (Warning: This will also remove employees)",
      choices: roleOptions,
    },
  ]);

  await DB.query("DELETE FROM role WHERE id = ?s", roleId);

  console.log("Removed role from the database");

  showPrompt();
};

let viewAllDepartments = async () => {
  const departments = await DB.query(
    "SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM department LEFT JOIN role ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id GROUP BY department.id, department.name"
  );

  console.log("\n");
  console.table(departments);

  showPrompt();
};

let addDepartment = async () => {
  const department = await inquirer.prompt([
    {
      name: "name",
      message: "What is the name of the department?",
    },
  ]);

  await DB.query("INSERT INTO department SET ?", department);

  console.log(`Added ${department.name} to the database`);

  showPrompt();
};

let removeDepartment = async () => {
  const departments = await DB.query(
    "SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM department LEFT JOIN role ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id GROUP BY department.id, department.name"
  );

  const departmentOptions = departments.map(({ id, name }) => ({
    name: name,
    value: id,
  }));

  const { departmentId } = await inquirer.prompt({
    type: "list",
    name: "departmentId",
    message:
      "Which department would you like to remove? (Warning: This will also remove associated roles and employees)",
    choices: departmentOptions,
  });

  await DB.query("DELETE FROM department WHERE id = ?", departmentId);

  console.log(`Removed department from the database`);

  showPrompt();
};

let viewTotalUtilizedBudget = async () => {
  const departments = await DB.query(
    "SELECT department.id, department.name FROM department"
  );

  const departmentOptions = departments.map(({ id, name }) => ({
    name: name,
    value: id,
  }));
  const { departmentId } = await inquirer.prompt([
    {
      type: "list",
      name: "departmentId",
      message:
        "Which department would you like to see total utilized budget for?",
      choices: departmentOptions,
    },
  ]);

  const result = await DB.query(
    "SELECT  SUM(role.salary) AS totalUtilizedBudget FROM role,employee WHERE role.department_id = ? AND role.id = employee.role_id GROUP BY role.department_id",
    [departmentId]
  );
  console.log(`The total utilized budget is ${result[0].totalUtilizedBudget}`);
  showPrompt();
};

let quit = () => {
  console.log("Goodbye!");
  process.exit();
};

const main = async () => {
  DB.connect(function (err) {
    if (err) {
      console.log(err);
      quit();
    }
  });

  showPrompt();
};

main();
