import {useEffect} from 'react';
const API_BASE = "http://localhost:3001";
let editingId = null;


export default function EmployeeManagement(){
    class Employee {

  constructor(firstname, lastname, email, birthdate, salary = null, employee_id = null){
    this.employee_id = employee_id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.birthdate = birthdate;
    this.salary = salary;
  }

  static async deleteById(id) {
  try {
    console.log("Deleting employee id:", id, typeof id);
    const res = await fetch(`${API_BASE}/employees/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`DELETE /employees/${id} ${res.status} ${detail}`);
    }
    // Remove locally and re-render (coerce types just in case)
    const target = Number(id);
    Employee.employees = Employee.employees.filter(e => Number(e.employee_id) !== target);
    Employee.updateTable();
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Delete failed: " + err.message);
  }
}

  editEmployee({firstname, lastname, email, birthdate}){
    if (firstname)
      {this.firstname = firstname;}
    if (lastname)
      {this.lastname = lastname;}
    if (email)
      {this.email = email;}
    if (birthdate)  
      {this.birthdate = birthdate;}

    Employee.updateTable();
  }

  static employees = []

//   static addEmployee(){
//     document.getElementById("addEmp")?.addEventListener("submit", function(e){
//       e.preventDefault();
//       let firstname = document.getElementById("first_name").value;
//       let lastname = document.getElementById("last_name").value;
//       let email = document.getElementById("email").value;
//       let birthdate = document.getElementById("birthdate").value;
//       Employee.employees.push(new Employee(firstname, lastname, email, birthdate));
//       Employee.updateTable();

//       //following used to prove edit method is working properly
//       if (Employee.employees.length > 1)
//         {Employee.employees[0].editEmployee({firstname: "Proof of edit method functionality"});}
        
//       })
//     }

  static updateTable(){
    const tbody = document.getElementById("employeeTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    for (const emp of Employee.employees){
        const { firstname, lastname, email, birthdate, salary } = emp;
        const tr = document.createElement("tr");

        const td1 = document.createElement("td"); td1.textContent = firstname; tr.appendChild(td1);
        const td2 = document.createElement("td"); td2.textContent = lastname;  tr.appendChild(td2);
        const td3 = document.createElement("td"); td3.textContent = email;     tr.appendChild(td3);
        const td4 = document.createElement("td"); td4.textContent = birthdate; tr.appendChild(td4);
        const td5 = document.createElement("td"); td5.textContent = salary;    tr.appendChild(td5);

        const td6 = document.createElement("td");
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", async () => {
        await Employee.deleteById(emp.employee_id);});
        td6.appendChild(delBtn);
        tr.appendChild(td6);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginLeft = "8px";
        editBtn.addEventListener("click", () => {
          // Fill form inputs with this employee’s data (use the actual IDs in your form)
          document.getElementById("first_name").value = emp.firstname;
          document.getElementById("last_name").value  = emp.lastname;
          document.getElementById("email").value      = emp.email;
          document.getElementById("birthdate").value  = (emp.birthdate || "").slice(0, 10);
          document.getElementById("salary").value     = emp.salary ?? "";

          // Switch to edit mode
          editingId = emp.employee_id;

          // Update the submit button label on the correct form
          const submitBtn = document.querySelector('#addEmp button[type="submit"]');
          if (submitBtn) submitBtn.textContent = "Update";
        });


        td6.appendChild(editBtn);

        tbody.appendChild(tr);
  }
        }
    }

useEffect(() => {
  // 1) Load existing rows from DB on mount
  const loadEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (!res.ok) throw new Error(`GET /employees ${res.status}`);
      const rows = await res.json();
      Employee.employees = rows.map(r =>
        new Employee(
          r.first_name,
          r.last_name,
          r.email,
          (r.birthdate || "").slice(0, 10),
          r.salary ?? null,
          r.employee_id ?? null
        )
      );
      Employee.updateTable();
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };
  loadEmployees();

  // 2) Submit handler -> POST to DB
  const form = document.getElementById("addEmp");
  if (!form) return;

  const onSubmit = async (e) => {
  e.preventDefault();

const firstname = document.getElementById("first_name").value.trim();
const lastname  = document.getElementById("last_name").value.trim();
const email     = document.getElementById("email").value.trim();
const birthdate = document.getElementById("birthdate").value;
const salaryRaw = document.getElementById("salary").value;
const salary    = salaryRaw === "" ? null : Number(salaryRaw);

const payload = { first_name: firstname, last_name: lastname, email, birthdate, salary };

try {
  if (editingId == null) {
    // ADD (POST)
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`POST /employees ${res.status}: ${msg}`);
    }
    const row = await res.json();
    Employee.employees.push(
      new Employee(
        row.first_name, row.last_name, row.email,
        (row.birthdate || "").slice(0, 10),
        row.salary ?? null,
        row.employee_id ?? null
      )
    );
  } else {
    // EDIT (PUT)
    const res = await fetch(`${API_BASE}/employees/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`PUT /employees/${editingId} ${res.status}: ${msg}`);
    }
    const row = await res.json();

    // Replace local row with server truth
    const idx = Employee.employees.findIndex(e => Number(e.employee_id) === Number(editingId));
    if (idx !== -1) {
      Employee.employees[idx] = new Employee(
        row.first_name, row.last_name, row.email,
        (row.birthdate || "").slice(0, 10),
        row.salary ?? null,
        row.employee_id ?? null
      );
    }

    // Reset mode + button label
    editingId = null;
    const submitBtn = document.querySelector('#addEmp button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Submit";
  }

  Employee.updateTable();
  form.reset();
} catch (err) {
  console.error("Save failed:", err);
  alert("Save failed: " + err.message);
}

  };

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}, []);


    return (
    <>
    <section>
        <h2>Employee List</h2>
        <table id={"employeeTable"}>
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Birthdate</th>
                    <th>Salary</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id={"employeeTableBody"}>
            </tbody>
        </table>
    </section>
<hr />
    <section>
        <h2>Add New Employee</h2>
        <form id={"addEmp"}>
            <label>First Name:</label>
            <input type={"text"} id={"first_name"} required /><br></br>

            <label>Last Name:</label>
            <input type={"text"} id={"last_name"} required /><br></br>

            <label>Email:</label>
            <input type={"email"} id={"email"} required /><br></br>

            <label >Birthdate:</label>
            <input type={"date"} id={"birthdate"} required /><br></br>

            <label >Salary</label>
            <input type={"number"} id={"salary"} step={"0.01"} required /><br></br>

            <button className={"btn btn-primary"} type={"submit"}>Submit</button>

        </form>
    </section>
    </>
    
    );
}