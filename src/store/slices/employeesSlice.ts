import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Employee, employees as initialEmployees } from "@/data/mockData";

interface EmployeesState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
}

const initialState: EmployeesState = {
  employees: initialEmployees,
  selectedEmployee: null,
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setDepartmentFilter: (state, action: PayloadAction<string>) => {
      state.departmentFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
  },
});

export const {
  setSelectedEmployee,
  setSearchQuery,
  setDepartmentFilter,
  setStatusFilter,
  addEmployee,
  updateEmployee,
} = employeesSlice.actions;

export default employeesSlice.reducer;
