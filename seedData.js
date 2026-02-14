const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
require('dotenv').config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Job.deleteMany({});
        await Company.deleteMany({});
        console.log('Cleared existing data');

        // Create sample users
        const users = await User.create([
            {
                name: 'Ali Ahmed',
                email: 'ali.ahmed@example.com',
                password: '123456',
                role: 'job_seeker',
                profile: {
                    phone: '+923001234567',
                    location: 'Karachi',
                    bio: 'Full-stack developer with 3 years of experience',
                    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python']
                }
            },
            {
                name: 'Sara Khan',
                email: 'sara.khan@example.com',
                password: '123456',
                role: 'employer',
                profile: {
                    phone: '+923001234568',
                    location: 'Lahore',
                    bio: 'HR Manager at Tech Solutions'
                }
            },
            {
                name: 'Admin User',
                email: 'admin@pakjobs.com',
                password: '123456',
                role: 'admin'
            }
        ]);

        console.log('Sample users created');

        // Create sample companies
        const companies = await Company.create([
            {
                name: 'Systems Limited',
                description: 'Leading IT services and consulting company in Pakistan',
                website: 'https://www.systemsltd.com',
                industry: 'Technology',
                size: '1000+',
                location: {
                    city: 'Karachi',
                    country: 'Pakistan'
                },
                contact: {
                    email: 'careers@systemsltd.com',
                    phone: '+92213567890'
                },
                createdBy: users[1]._id
            },
            {
                name: 'Engro Corporation',
                description: 'One of Pakistan largest conglomerates',
                website: 'https://www.engro.com',
                industry: 'Manufacturing',
                size: '1000+',
                location: {
                    city: 'Karachi',
                    country: 'Pakistan'
                },
                contact: {
                    email: 'hr@engro.com',
                    phone: '+92216543210'
                },
                createdBy: users[1]._id
            }
        ]);

        console.log('Sample companies created');

        // Create sample jobs
        const jobs = await Job.create([
            {
                title: "Senior Software Engineer",
                company: "Systems Limited",
                description: "We are looking for a skilled Senior Software Engineer to join our dynamic team. You will be responsible for developing and maintaining high-quality software solutions using modern technologies.",
                requirements: "3+ years of experience in software development, proficiency in JavaScript and React, experience with Node.js and MongoDB, strong problem-solving skills.",
                location: "Karachi",
                type: "Full-time",
                category: "IT & Software",
                experience: "3-5 years",
                salary: {
                    min: 150000,
                    max: 200000,
                    currency: "PKR"
                },
                skills: ["JavaScript", "React", "Node.js", "MongoDB", "TypeScript"],
                isRemote: false,
                isFeatured: true,
                isUrgent: false,
                applicationDeadline: new Date('2024-12-31'),
                createdBy: users[1]._id
            },
            {
                title: "Frontend Developer (Remote)",
                company: "Techlogix",
                description: "We're seeking a talented Frontend Developer to create beautiful and responsive web applications. This is a fully remote position with flexible working hours.",
                requirements: "2+ years of frontend development experience, proficiency in React and modern JavaScript, strong CSS skills, experience with responsive design.",
                location: "Remote",
                type: "Full-time",
                category: "IT & Software",
                experience: "2-4 years",
                salary: {
                    min: 100000,
                    max: 150000,
                    currency: "PKR"
                },
                skills: ["React", "JavaScript", "CSS", "HTML5", "UI/UX"],
                isRemote: true,
                isFeatured: true,
                isUrgent: false,
                applicationDeadline: new Date('2024-11-30'),
                createdBy: users[1]._id
            },
            {
                title: "Marketing Manager",
                company: "Engro Corporation",
                description: "Join our marketing team to drive brand growth and develop innovative marketing strategies. You will lead a team of marketing professionals and work on exciting campaigns.",
                requirements: "5+ years in marketing, team management experience, strong analytical skills, knowledge of digital marketing trends and tools.",
                location: "Karachi",
                type: "Full-time",
                category: "Business & Marketing",
                experience: "5+ years",
                salary: {
                    min: 120000,
                    max: 180000,
                    currency: "PKR"
                },
                skills: ["Digital Marketing", "Strategy", "Team Management", "Analytics"],
                isRemote: false,
                isFeatured: false,
                isUrgent: true,
                applicationDeadline: new Date('2024-10-15'),
                createdBy: users[1]._id
            },
            {
                title: "Data Analyst",
                company: "Jazz",
                description: "Join our data team to analyze customer behavior and provide insights for business decisions. You'll work with large datasets and create reports.",
                requirements: "1+ years of data analysis experience, proficiency in SQL and Python, knowledge of data visualization tools.",
                location: "Islamabad",
                type: "Full-time",
                category: "IT & Software",
                experience: "1-3 years",
                salary: {
                    min: 80000,
                    max: 120000,
                    currency: "PKR"
                },
                skills: ["SQL", "Python", "Data Visualization", "Statistics", "Excel"],
                isRemote: false,
                isFeatured: false,
                isUrgent: false,
                applicationDeadline: new Date('2024-11-20'),
                createdBy: users[1]._id
            },
            {
                title: "UX/UI Designer",
                company: "Airlift",
                description: "Join our design team to create intuitive and beautiful user experiences for our mobile and web applications.",
                requirements: "2+ years of UX/UI design experience, proficiency in Figma, strong portfolio of design work.",
                location: "Lahore",
                type: "Full-time",
                category: "Design",
                experience: "2-4 years",
                salary: {
                    min: 90000,
                    max: 140000,
                    currency: "PKR"
                },
                skills: ["Figma", "User Research", "Prototyping", "UI Design", "Wireframing"],
                isRemote: false,
                isFeatured: false,
                isUrgent: false,
                applicationDeadline: new Date('2024-10-30'),
                createdBy: users[1]._id
            },
            {
                title: "Product Manager",
                company: "Careem",
                description: "We're looking for an experienced Product Manager to lead product development initiatives and drive product strategy.",
                requirements: "4+ years of product management experience, strong analytical skills, experience with agile methodologies.",
                location: "Karachi",
                type: "Full-time",
                category: "Business & Marketing",
                experience: "4-6 years",
                salary: {
                    min: 200000,
                    max: 250000,
                    currency: "PKR"
                },
                skills: ["Product Strategy", "Agile", "User Research", "Roadmapping", "Analytics"],
                isRemote: false,
                isFeatured: true,
                isUrgent: true,
                applicationDeadline: new Date('2024-10-25'),
                createdBy: users[1]._id
            }
        ]);

        console.log('Sample jobs created');
        console.log(`Seeded ${users.length} users, ${companies.length} companies, and ${jobs.length} jobs`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();