import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dayflow_hrms';

async function seed() {
  console.log('🔄 Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  // 1. Clear existing database collections
  console.log('🧹 Clearing existing collections (users, attendances, leaves, notifications)...');
  await User.deleteMany({});
  await Attendance.deleteMany({});
  await Leave.deleteMany({});
  await Notification.deleteMany({});
  console.log('✅ Collections cleared successfully.');

  // 2. Define 2 HR Admin Accounts
  const hrAdminsData = [
    {
      employeeId: 'HR-001',
      name: 'Sarah Jenkins',
      email: 'admin@dayflow.com', // Primary HR & admin account
      password: 'Admin@1234',
      role: 'admin',
      isEmailVerified: true,
      phone: '+1 (555) 234-5678',
      address: '450 Lexington Ave, New York, NY',
      jobDetails: {
        designation: 'Senior HR Business Partner',
        department: 'Human Resources',
        joiningDate: new Date('2023-01-15'),
      },
      salaryStructure: {
        basic: 6000,
        hra: 2000,
        allowances: 1000,
        deductions: 800,
      },
    },
    {
      employeeId: 'HR-002',
      name: 'Alex Mercer',
      email: 'hr.alex@dayflow.com',
      password: 'Admin@1234',
      role: 'admin',
      isEmailVerified: true,
      phone: '+1 (555) 345-6789',
      address: '780 Market St, San Francisco, CA',
      jobDetails: {
        designation: 'People Operations Lead',
        department: 'People Operations',
        joiningDate: new Date('2023-05-20'),
      },
      salaryStructure: {
        basic: 5200,
        hra: 1600,
        allowances: 800,
        deductions: 650,
      },
    },
  ];

  // 3. Define 5 Mid-Scale Employees
  const employeesData = [
    {
      employeeId: 'EMP-101',
      name: 'Ethan Vance',
      email: 'employee@dayflow.com', // Primary demo employee
      password: 'Employee@1234',
      role: 'employee',
      isEmailVerified: true,
      phone: '+1 (555) 456-7890',
      address: '742 Evergreen Terrace, Seattle, WA',
      jobDetails: {
        designation: 'Senior Full-Stack Engineer',
        department: 'Engineering',
        joiningDate: new Date('2024-02-01'),
      },
      salaryStructure: {
        basic: 4800,
        hra: 1600,
        allowances: 900,
        deductions: 700,
      }, // Gross: $7,300, Net: $6,600/month ($79,200/yr)
    },
    {
      employeeId: 'EMP-102',
      name: 'Maya Patel',
      email: 'maya.patel@dayflow.com',
      password: 'Employee@1234',
      role: 'employee',
      isEmailVerified: true,
      phone: '+1 (555) 567-8901',
      address: '1204 Pine Street, San Francisco, CA',
      jobDetails: {
        designation: 'Senior UI/UX Designer',
        department: 'Product & Design',
        joiningDate: new Date('2024-04-15'),
      },
      salaryStructure: {
        basic: 4500,
        hra: 1500,
        allowances: 800,
        deductions: 600,
      }, // Gross: $6,800, Net: $6,200/month ($74,400/yr)
    },
    {
      employeeId: 'EMP-103',
      name: 'David Kim',
      email: 'david.kim@dayflow.com',
      password: 'Employee@1234',
      role: 'employee',
      isEmailVerified: true,
      phone: '+1 (555) 678-9012',
      address: '88 Austin Blvd, Austin, TX',
      jobDetails: {
        designation: 'Cloud DevOps Engineer',
        department: 'Cloud & Infrastructure',
        joiningDate: new Date('2024-06-10'),
      },
      salaryStructure: {
        basic: 5000,
        hra: 1700,
        allowances: 950,
        deductions: 750,
      }, // Gross: $7,650, Net: $6,900/month ($82,800/yr)
    },
    {
      employeeId: 'EMP-104',
      name: 'Chloe Bennett',
      email: 'chloe.bennett@dayflow.com',
      password: 'Employee@1234',
      role: 'employee',
      isEmailVerified: true,
      phone: '+1 (555) 789-0123',
      address: '350 Fifth Ave, New York, NY',
      jobDetails: {
        designation: 'Growth Marketing Specialist',
        department: 'Marketing & Growth',
        joiningDate: new Date('2024-07-20'),
      },
      salaryStructure: {
        basic: 4200,
        hra: 1400,
        allowances: 700,
        deductions: 550,
      }, // Gross: $6,300, Net: $5,750/month ($69,000/yr)
    },
    {
      employeeId: 'EMP-105',
      name: 'Marcus Hayes',
      email: 'marcus.hayes@dayflow.com',
      password: 'Employee@1234',
      role: 'employee',
      isEmailVerified: true,
      phone: '+1 (555) 890-1234',
      address: '1000 Michigan Ave, Chicago, IL',
      jobDetails: {
        designation: 'Operations & Solutions Specialist',
        department: 'Operations',
        joiningDate: new Date('2024-09-01'),
      },
      salaryStructure: {
        basic: 3800,
        hra: 1300,
        allowances: 650,
        deductions: 500,
      }, // Gross: $5,750, Net: $5,250/month ($63,000/yr)
    },
  ];

  console.log('👤 Seeding HR Admins and Employees...');
  const createdHRs = [];
  for (const hr of hrAdminsData) {
    const user = new User(hr);
    await user.save();
    createdHRs.push(user);
    console.log(`   + HR Admin: ${user.name} (${user.email} | ${user.employeeId})`);
  }

  const createdEmployees = [];
  for (const emp of employeesData) {
    const user = new User(emp);
    await user.save();
    createdEmployees.push(user);
    const net = emp.salaryStructure.basic + emp.salaryStructure.hra + emp.salaryStructure.allowances - emp.salaryStructure.deductions;
    console.log(`   + Employee: ${user.name} (${user.email} | ${user.employeeId}) | Net Salary: $${net}/mo`);
  }

  const primaryAdmin = createdHRs[0];

  // 4. Seed Attendance Records for Employees
  console.log('⏱️  Seeding attendance history for employees...');
  for (const emp of createdEmployees) {
    // Aug 18: Present
    await Attendance.create({
      employee: emp._id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.jobDetails.department,
      date: '2026-08-18',
      checkInTime: new Date('2026-08-18T09:02:00Z'),
      checkOutTime: new Date('2026-08-18T17:35:00Z'),
      workDurationMinutes: 513,
      status: 'Present',
      notes: 'Full shift completed on time.',
    });

    // Aug 19: Maya had Sick Leave, Marcus Half-day, others Present
    if (emp.employeeId === 'EMP-102') {
      await Attendance.create({
        employee: emp._id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        date: '2026-08-19',
        status: 'Leave',
        notes: 'Approved Sick Leave',
      });
    } else if (emp.employeeId === 'EMP-105') {
      await Attendance.create({
        employee: emp._id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        date: '2026-08-19',
        checkInTime: new Date('2026-08-19T09:15:00Z'),
        checkOutTime: new Date('2026-08-19T13:00:00Z'),
        workDurationMinutes: 225,
        status: 'Half-day',
        notes: 'Half day logged.',
      });
    } else {
      await Attendance.create({
        employee: emp._id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        date: '2026-08-19',
        checkInTime: new Date('2026-08-19T08:58:00Z'),
        checkOutTime: new Date('2026-08-19T17:15:00Z'),
        workDurationMinutes: 497,
        status: 'Present',
        notes: 'Regular workday.',
      });
    }

    // Aug 20: Present
    await Attendance.create({
      employee: emp._id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.jobDetails.department,
      date: '2026-08-20',
      checkInTime: new Date('2026-08-20T09:05:00Z'),
      checkOutTime: new Date('2026-08-20T17:30:00Z'),
      workDurationMinutes: 505,
      status: 'Present',
      notes: 'Standard shift.',
    });

    // Aug 21: Present
    await Attendance.create({
      employee: emp._id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.jobDetails.department,
      date: '2026-08-21',
      checkInTime: new Date('2026-08-21T09:10:00Z'),
      checkOutTime: new Date('2026-08-21T17:40:00Z'),
      workDurationMinutes: 510,
      status: 'Present',
      notes: 'Friday shift.',
    });

    // Today (Aug 22): Active check-in for Ethan & Maya
    if (emp.employeeId === 'EMP-101' || emp.employeeId === 'EMP-102') {
      await Attendance.create({
        employee: emp._id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        date: '2026-08-22',
        checkInTime: new Date('2026-08-22T09:00:00Z'),
        status: 'Present',
        notes: 'Active session today.',
      });
    }
  }
  console.log('✅ Attendance records seeded.');

  // 5. Seed Leave Applications (using YYYY-MM-DD strings)
  console.log('🏖️  Seeding leave applications and balances...');
  const ethan = createdEmployees[0];
  const maya = createdEmployees[1];
  const david = createdEmployees[2];
  const chloe = createdEmployees[3];
  const marcus = createdEmployees[4];

  // Ethan: Approved Paid Leave
  await Leave.create({
    employee: ethan._id,
    employeeId: ethan.employeeId,
    employeeName: ethan.name,
    department: ethan.jobDetails.department,
    leaveType: 'Paid',
    startDate: '2026-08-25',
    endDate: '2026-08-27',
    daysCount: 3,
    remarks: 'Annual summer holiday with family.',
    status: 'Approved',
    adminComment: 'Approved. Enjoy your time off!',
    reviewedBy: primaryAdmin._id,
    reviewedAt: new Date('2026-08-20T10:30:00Z'),
  });

  // Maya: Approved Sick Leave
  await Leave.create({
    employee: maya._id,
    employeeId: maya.employeeId,
    employeeName: maya.name,
    department: maya.jobDetails.department,
    leaveType: 'Sick',
    startDate: '2026-08-19',
    endDate: '2026-08-19',
    daysCount: 1,
    remarks: 'Mild fever and doctor appointment.',
    status: 'Approved',
    adminComment: 'Approved. Rest well and get better.',
    reviewedBy: primaryAdmin._id,
    reviewedAt: new Date('2026-08-18T18:00:00Z'),
  });

  // David: Pending Paid Leave
  await Leave.create({
    employee: david._id,
    employeeId: david.employeeId,
    employeeName: david.name,
    department: david.jobDetails.department,
    leaveType: 'Paid',
    startDate: '2026-09-02',
    endDate: '2026-09-05',
    daysCount: 4,
    remarks: 'Attending DevOps & Cloud Summit in Seattle.',
    status: 'Pending',
  });

  // Chloe: Approved Paid Leave (Past)
  await Leave.create({
    employee: chloe._id,
    employeeId: chloe.employeeId,
    employeeName: chloe.name,
    department: chloe.jobDetails.department,
    leaveType: 'Paid',
    startDate: '2026-08-11',
    endDate: '2026-08-12',
    daysCount: 2,
    remarks: 'Family wedding event.',
    status: 'Approved',
    adminComment: 'Approved by Management.',
    reviewedBy: primaryAdmin._id,
    reviewedAt: new Date('2026-08-09T14:20:00Z'),
  });

  // Marcus: Pending Unpaid Leave
  await Leave.create({
    employee: marcus._id,
    employeeId: marcus.employeeId,
    employeeName: marcus.name,
    department: marcus.jobDetails.department,
    leaveType: 'Unpaid',
    startDate: '2026-08-28',
    endDate: '2026-08-28',
    daysCount: 1,
    remarks: 'Relocation errands and lease signing.',
    status: 'Pending',
  });
  console.log('✅ Leave requests seeded.');

  // 6. Seed In-App Notifications
  console.log('🔔 Seeding in-app notifications...');
  for (const emp of createdEmployees) {
    // Welcome Notification
    await Notification.create({
      userId: emp._id,
      title: 'Welcome to Dayflow HRMS',
      message: `Welcome aboard, ${emp.name}! Your workspace profile is now fully initialized.`,
      type: 'onboarding',
      isRead: true,
      link: '/employee/profile',
    });

    // Salary Structure Notification
    const net = emp.salaryStructure.basic + emp.salaryStructure.hra + emp.salaryStructure.allowances - emp.salaryStructure.deductions;
    await Notification.create({
      userId: emp._id,
      title: 'Salary Structure Configured',
      message: `Your monthly compensation is set to $${net.toLocaleString()} Net Take-Home ($${(net * 12).toLocaleString()}/yr).`,
      type: 'payroll',
      isRead: false,
      link: '/employee/payroll',
    });
  }

  // Ethan Leave Notification
  await Notification.create({
    userId: ethan._id,
    title: 'Leave Request Approved',
    message: 'Your Paid Leave application for Aug 25 - Aug 27 (3 days) has been approved by HR.',
    type: 'leave',
    isRead: false,
    link: '/employee/leave',
  });

  // Maya Leave Notification
  await Notification.create({
    userId: maya._id,
    title: 'Leave Request Approved',
    message: 'Your Sick Leave application for Aug 19 has been approved by HR.',
    type: 'leave',
    isRead: true,
    link: '/employee/leave',
  });

  console.log('✅ In-app notifications seeded.');
  console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
