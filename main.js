const express = require("express");
const Handlebars  = require('express-handlebars');
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const path = require("path");
const bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');

const app = express();
//app.use(express.static(path.join(__dirname, "public")));

app.engine('handlebars', Handlebars());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

var hbs = Handlebars.create({});

const PORT = process.env.PORT || 8080;

const dbUri = "mongodb+srv://myuser:test1234@nodetuts.plosu.mongodb.net/sample_db?retryWrites=true&w=majority";
mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(function(result) {
        console.log("Connected to database.");
        app.listen(PORT, function() {
            console.log("Express server started on port " + PORT);
        });
    })
    .catch(function(err) {
        console.log(err);
    });

hbs.handlebars.registerHelper('submitBlogFunc', function(title, snippet, body) {
    console.log(title, snippet, body);
})

function getAllBlogs(callback) {
    Blog.find()
        .then(function(result) {
            callback(result);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function getSingleBlog(id, callback) {
    Blog.findById(id)
        .then(function(result) {
            callback(result);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function submitNewBlog(title, snippet, body) {
    const blog = new Blog({
        title: title,
        snippet: snippet,
        body: body
    });

    blog.save()
        .catch(function(err) {
            console.log(err);
        });
}

function reorderResult(result, callback) {
    var orderedResult = [];
    result.forEach(element => {
        orderedResult.push({
            "blogId": element._id,
            "title": element.title,
            "snippet": element.snippet
        });
    });

    callback(orderedResult);
}

app.get('/', function (req, res) {
    getAllBlogs(function(result) {
        console.log(result);
        reorderResult(result, function(reorderedResult) {
            res.render('home', {
                nBlogs: reorderedResult.length,
                tBlogs: reorderedResult.length,
                result: reorderedResult
            });
        });
    });
});

app.get("/add-blog", function(req, res) {
    var newQuery = req.query;
    if (newQuery.title != null && newQuery.snippet != null && newQuery.body != null) {
        submitNewBlog(unescape(newQuery.title), unescape(newQuery.snippet), unescape(newQuery.body));
        res.redirect("/");
    } else
        res.render("createBlog");
});

app.get("/view-blog", function(req, res) {
    var newQuery = req.query;
    if (newQuery.id != null) {
        getSingleBlog(newQuery.id, function(result) {
            if (result.title != null && result.snippet != null && result.body != null)
                res.render("viewBlog", {
                    _title: result.title,
                    _snippet: result.snippet,
                    _body: result.body
                });
            else
                res.send("Blog not found");
        });
    } else
        res.redirect("/");
});

app.get("/all-blogs", function(req, res) {
    Blog.find()
        .then(function(result) {
            res.send(result);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/search", function(req, res) {
    var newQuery = req.query;
    if (newQuery.searchTerm != null) {
        Blog.find({title: newQuery.searchTerm})
            .then(function(result) {
                reorderResult(result, function(reorderedResult) {
                    res.render("search", {
                        searchText: newQuery.searchTerm,
                        nBlogs: reorderedResult.length,
                        tBlogs: reorderedResult.length,
                        result: reorderedResult
                    });
                });
            });
    }
});

app.get("/single-blog", function(req, res) {
   Blog.findById("6043b9874fef4615101ac3cb")
        .then(function(result) {
            res.send(result);
        })
        .catch(function(err) {
            console.log(err);
        });
});