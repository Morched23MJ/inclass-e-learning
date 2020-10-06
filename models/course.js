const mongoose = require('mongoose');
const config = require('../config/database');

const CourseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    cover: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: Object,
        required: true
    }
});

const Course = module.exports = mongoose.model('Course', CourseSchema);

module.exports.getCourses = (query, callback) => {
    if (Object.keys(query).length === 0 && query.constructor === Object) Course.find(callback);
    else {
        const { page = 1, limit = 5 } = query;
        const courses = Course.find(callback)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
    }
}

module.exports.getUserCourses = (id, query, callback) => {
    if (Object.keys(query).length === 0 && query.constructor === Object) {
        Course.find().where("user._id", id).exec(callback);
    }
    else {
        const { page = 1, limit = 5 } = query;
        Course.find()
            .where("user._id", id)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec(callback);
    }
}

module.exports.getCourseById = (id, callback) => {
    Course.findById(id, callback);
}

module.exports.addCourse = (payload, callback) => {
    let course = new Course(payload);
    course.save(callback);
}

module.exports.updateCourse = (id, payload, token, callback) => {
    Course.findById(id, (err, doc) => {
        if (err) throw err;
        else if (doc) {
            if (doc.user._id == token._id) {
                doc.update(payload, callback);
            } else {
                return {
                    success: false,
                    message: "Unauthorized"
                }
            };
        }
    });
    //Course.findByIdAndUpdate(id, payload, callback);
}

module.exports.deleteCourse = (id, callback) => {
    let course = Course.findById(id);
    course.remove(callback);
}