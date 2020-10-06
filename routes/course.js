const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const passport = require('passport');
const parseJWT = require('../util/parseJWT');

router.get('/', (req, res, next) => {
    Course.getCourses(req.query, (err, courses) => {
        if (err) {
            res.json({
                success: false,
                message: "An error occured"
            });
        }
        else if (courses) {
            if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {
                res.json({
                    success: true,
                    message: "Courses successfully fetched",
                    courses: courses
                });
            }
            else {
                Course.countDocuments((err, count) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: "Could not get total pages"
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Courses successfully fetched",
                            currentPage: req.query.page,
                            totalPages: Math.ceil(count / req.query.limit),
                            courses: courses
                        });
                    }
                });
            }
        }
    });
})

router.get('/user/:id', (req, res, next) => {
    Course.getUserCourses(req.params.id, req.query, (err, courses) => {
        if (err) {
            res.json({
                success: false,
                message: "An error occured"
            });
        }
        else if (courses) {
            if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {
                res.json({
                    success: true,
                    message: "Courses successfully fetched",
                    courses: courses
                });
            } else {
                Course.countDocuments({ "user._id": req.params.id }, (err, count) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: "Could not get total pages"
                        });
                    } else {
                        console.log(count)
                        res.json({
                            success: true,
                            message: "Courses successfully fetched",
                            currentPage: req.query.page,
                            totalPages: Math.ceil(count / req.query.limit),
                            courses: courses
                        });
                    }
                });
            }
        }
    });
})

router.get('/:id', (req, res, next) => {
    Course.getCourseById(req.params.id, (err, course) => {
        if (err) {
            res.json({
                success: false,
                message: "Could not fetch course"
            });
        }
        else if (course) {
            res.json({
                success: true,
                message: "Course successfully fetched",
                course: course
            });
        }
    });
})

router.post('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    let token = parseJWT.parseToken(req.headers.authorization);
    console.log("POST" + token);
    Course.addCourse(req.body, (err, course) => {
        if (err) {
            res.json({
                success: false,
                message: `Couldn't add course, ${err}`
            });
        } else if (course) {
            res.json({
                success: true,
                message: "Course successfully added",
                course: course
            });
        }
    });
});

router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    let header = req.headers.authorization;
    let id = req.params.id;
    let body = req.body;
    let token = parseJWT.parseToken(header);
    Course.getCourseById(id, (err, course) => {
        if (err) {
            res.json({
                success: "false",
                message: "Couldn't get the course"
            });
        }
        else if (course) {
            console.log(token._id);
            if (course.user._id == token._id) {
                course.update(body, (err, doc) => {
                    if (err) {
                        console.error("Error!");
                        res.json({
                            success: false,
                            message: `Couldn't update document, ${err.message}`
                        });
                    } else if (doc) {
                        console.log("Course updated!")
                        res.json({
                            success: true,
                            message: `Successfully updated document`,
                            course: doc
                        });
                    }
                });
            } else {
                res.json({
                    success: "false",
                    message: "Unauthorized"
                });
            };
        }
    })
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    let token = parseJWT.parseToken(req.headers.authorization);
    Course.getCourseById(req.params.id, (err, course) => {
        if (err) {
            res.json({
                success: "false",
                message: "Couldn't get the course"
            });
        }
        else if (course) {
            console.log(token._id);
            if (course.user._id == token._id) {
                course.delete((err, doc) => {
                    if (err) {
                        console.error("Error!");
                        res.json({
                            success: false,
                            message: `Couldn't delete course, ${err.message}`
                        });
                    } else if (doc) {
                        console.log("Course updated!")
                        res.json({
                            success: true,
                            message: `Successfully deleted course`,
                            course: doc
                        });
                    }
                });
            } else {
                res.json({
                    success: "false",
                    message: "Unauthorized"
                });
            };
        }
    });
});

module.exports = router;