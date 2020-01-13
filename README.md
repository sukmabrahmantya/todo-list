# FANCY DOODOO

A simple todo app API with capabilities to organize groups and realtime todo update. Use express js, mongoose, and socket.io.



## Base Url

If you are using this API from source code then use:

```http
http://localhost:PORT
```

The default port used is 3000. But you can override it by assigning other value at `.env` (More on this at Usage section).



## Errors

This section is used to document error responses, cause, and possible ways to resolve it.

### Status 404: Not Found

- `Invalid endpoint/not found`: This means that the url is not found. Try recheck your request endpoint.
- `Group not found`: This happens when you try to access a specific group that's not exist, or you might just mistyped it's id. Check whether if you already sent the correct id.
- `User not found`: This could happen when you try to get a user, usually when you invite or kick a member from your group. The server will try to find if the user that will be invited/kicked is actually exist, and if not, will send this error.

### Status 422: Unprocessable Entity

- User validation error: This kind of error may occur during Sign Up, oftenly because invalid data value. Recheck whether or not the data you send has valid values, and also if it satisfies all constraints (uniqueness, not empty, etc.). Example error messages: `Username already taken`,  `Email required`, `Password must have at least 6 characters`
- `Username, email, or password wrong`: This error happens during Sign In. It simply indicates that the data you enter is invalid (whether it's actually wrong or some fields are missing). Please recheck the data you send.
- Group validation error: This kind of error could happen when you try to manipulate group (create, edit, invite member, etc.), but some data that you send are invalid or missing. Recheck every data that you send, including the existence of member that you refer when trying to Invite or Kick Member. Example error messages: `Group name required`, `User already invited`, `Invalid member id`
- Todo validation error: This kind of error could occur during todo creation and manipulation (edit, delete, etc.). Check whether if you have sent all required data, and whether those data are valid. Example error messages: `Todo name required`
- `Invalid object id`: This error happens when you access routes that needs to specify id (example: Get On Private Id, Delete Private Id). Recheck wheter you sent valid id.

### Status 401: Unauthorized

- `Valid acccess token required`: This happens when you try to access endpoint that require authentication. Make sure to check whether you have included your `access_token` to your request header. If so, but the error still persist, then try to get new token from Sign In endpoint.

### Status 403: Forbidden

- `Unauthorized access to this group`: This means that you are trying to access/manipulate group (oftenly inviting/kicking members) but you don't have the privilege to do so, since only group leader that has access to member control.



## User Routes

### Sign Up

Register yourself to database, so you have access to all other endpoints.

##### Endpoint

```http
POST /signup
```

##### Body

- username: String **Required** (Must only have alphanumeric characters, underscores, and dots.)
- email: String **Required** (Must have valid email format and can be verified.)
- password: String **Required** (Must have at least 6 characters.)

##### Response

###### Status 201: Created

```json
{
  "message": "User registered",
    "data": {
      "username": "dummy",
  		"email": "dummy@mail.com",
		  "password": "123456"
  }
}
```



### Sign In

Get your `access_token` to be used in other endpoints.

##### Endpoint

```http
POST /signin
```

##### Body

- username | email | emailUsername: String **Required** (Only require at least one of three fields. `emailUsername` field may contain either email or username.)
- password: String **Required**

##### Response

###### Status 200: OK

```json
{
  "message": "Sign in success"
  "data": {
  	"access_token": "very_long_access_token"
	}
}
```



### Check Session

This endpoint serves as client `access_token` validation, and exposes token owner.

##### Endpoint

```http
GET /checksession
```

##### Header

- access_token: String **Required**

##### Response

###### Status 200: OK

```json
{
	"message": "Token valid",
  "data": {
      "id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com",
      "iat": 1574667955
  }
}
```



### Get All Users

##### Endpoint

```http
GET /user
```

##### Header

- access_token: String **Required**

##### Response

###### Status 200: OK

```json
{
  "data": [
    {
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    {
      "username": "dummy2",
      "email": "dummy2@mail.com"
    }
  ]
}
```



## Group Routes

### Create Group

##### Endpoint

```http
POST /groups
```

##### Header

- access_token: String **Required**

##### Body

- name: String **Required**

##### Response

###### Status 201: Created

```json
{
  "message": "Group created",
  "data": {
    "_id": "5ddb89a16a8fd9fd116889eb",
    "name": "Dummy group",
    "leader": {
      "_id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "members": []
  }
}
```



### Get User Groups

##### Endpoint

```http
GET /user/groups?as=[leader][members]
```

##### Header

- access_token: String **Required**

##### Query

- as: "leader" | "members" **Optional**

##### Response

###### Status 200: OK

```json
{
	"data": [
		{
			"_id": "5ddb8ddfa266870182d3182e",
      "name": "Dummy group",
      "leader": {
        "_id": "5ddb85b06a8fd9fd116889e6",
        "username": "dummy",
        "email": "dummy@mail.com"
      },
      "members": []
    }
	]
}
```



### Get One Group

##### Endpoint

```http
GET /groups/:id
```

##### Header

- access_token: String **Required**

##### Params

- id: String **Required** (Group id that you want to get)

##### Response

###### Status 200: OK

```json
{
  "data": {
    "_id": "5ddb8ddfa266870182d3182e",
    "name": "Dummy group",
    "leader": {
      "_id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "members": []
}

```



### Edit Group Name

##### Endpoint

```http
PATCH /groups/:id
```

##### Header

- access_token: String **Required**

##### Params

- id: String **Required** (Group id to which you invite new member)

##### Body

- name: String **Required**

##### Response

###### Status 200: OK

```json
{
  "message": "Group name updated",
  "data": {
    "_id": "5ddbadecccff181332f92b92",
    "name": "Edited Dummy Group",
    "leader": {
      "_id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "members": []
  }
}
```



### Invite Member

##### Endpoint

```http
PATCH /groups/:id/members
```

##### Header

- access_token: String **Required**

##### Params

- id: String **Required** (Group id to which you invite new member)

##### Body

- email: String **Required** (Valid email of new member where we send the invitation email to)

##### Response

###### Status 200: OK

```json
{
	"message": "New member invited",
  "data": {
    "_id": "5ddbadecccff181332f92b92",
    "name": "Dummy group",
    "leader": {
      "_id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "members": [
      {
        "_id": "5ddb86ec6a8fd9fd116889e8",
        "username": "dummy2",
        "email": "dummy2@mail.com"
      }
    ]
  }
}
```



### Kick Member

##### Endpoint

```http
DELETE /groups/:id/members/:member_id
```

##### Header

- access_token: String **Required**

##### Params

- id: String **Required** (Group id in which a member will be kicked)
- member_id: String **Required** (Id of member that will be kicked)

##### Response

###### Status 200: OK

```json
{
  "message": "Member kicked",
  "data": {
    "_id": "5ddbadecccff181332f92b92",
    "name": "Dummy group",
    "leader": {
      "_id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "members": []
  }
}
```



### Delete Group

##### Enpoint

```http
DELETE /groups/:id
```

##### Header

- access_token: String **Required**

##### Response

###### Status 200: OK

```json
{
  "message": "Group deleted"
}
```



### Leave Group

##### Endpoint

```http
DELETE /groups/:id/leave
```

##### Header

- access_token: String **Required**

##### Response

###### Status 200: OK

```json
{
  "message": "You have left the group",
  "data": {
    "_id": "5ddbadecccff181332f92b92",
    "name": "Dummy group",
    "leader": {
      "_id": "5ddb85b06a8fd9fd116889e6",
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "members": []
  }
}
```



## Todo Routes

### Create Private Todo

##### Endpoint

```http
POST /todos
```

##### Header

- access_token: String **Required**

##### Body

- name: String **Required**
- description: String **Optional**
- dueDate: String | Date **Optional** (String format: YYYY-MM-DD. If ommited, the due date will be set to today)

##### Response

###### Status 201: Created

```json
{
  "message": "Todo created",
  "data": {
    "_id": "5ddcf09e02127b06a362bba0",
    "name": "Dummy todo",
    "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error necessitatibus quibusdam est assumenda facilis repellat repudiandae eveniet laborum hic impedit? Delectus saepe fuga dolorum accusantium expedita veniam sapiente esse provident.",
    "dueDate": "2019-11-26T16:59:59.000Z",
    "createdAt": "2019-11-26T09:30:06.490Z",
    "status": "pending"
  }
}
```



### Create Group Todo

##### Endpoint

```http
POST /groups/:id/todos
```

##### Header

- access_token: String **Required**

##### Param

- id: String **Required** (Group id where you create new todo)

##### Body

- name: String **Required**
- description: String **Optional**
- dueDate: String | Date **Optional** (String format: YYYY-MM-DD. If ommited, the due date will be set to today)

##### Response

###### Status 201: Created

```json
{
  "message": "Todo created",
  "data": {
    "_id": "5ddd079569cdd60af0c88cfa",
    "name": "Dummy todo",
    "description": "This is group todo",
    "group": "5ddbadecccff181332f92b92",
    "dueDate": "2019-11-26T16:59:59.000Z",
    "createdAt": "2019-11-26T11:08:05.867Z",
    "status": "pending"
  }
}
```



### Get All User Todos

##### Endpoint

```http
GET /user/todos?from=[private][id]
```

##### Header

- access_token: String **Required**

##### Query

- from: `id` | "private" **Optional** (Filter todos to specific groups by specifying it's `group id`, or filter only private todos by setting value to string "private")

##### Response

###### Status 200: OK

```json
{
  "data": [
    {
      "_id": "5ddcf0547a90b0068f2d966f",
      "name": "Dummy todo",
      "creator": {
        "username": "dummy",
        "email": "dummy@mail.com"
      },
      "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error necessitatibus quibusdam est assumenda facilis repellat repudiandae eveniet laborum hic impedit? Delectus saepe fuga dolorum accusantium expedita veniam sapiente esse provident.",
      "dueDate": "2020-01-01T16:59:59.000Z",
      "updatedAt": "2019-11-26T09:28:52.372Z",
      "status": "pending"
    }
  ]
}
```



### Get All Group Todos

##### Endpoint

```http
GET /groups/:id/todos
```

##### Header

- access_token: String **Required**

##### Param

- id: String **Required** (Group id where you want to get the todo)

##### Response

###### Status 200: OK

```json
{
  "data": [
    {
      "_id": "5ddd07283c78fd0aa29bdcf1",
      "name": "Dummy todo",
      "creator": {
        "username": "dummy",
        "email": "dummy@mail.com"
      },
      "description": "This is group todo",
      "dueDate": "2019-11-26T16:59:59.000Z",
      "updatedAt": "2019-11-26T11:06:16.286Z",
      "status": "pending"
    }
  ]
}
```



### Get One Todo

##### Endpoint

```http
GET /todos/:id
```

##### Header

- access_token: String **Required**

##### Param

- id: String **Required** (Todo id to identify which todo to get)

##### Response

###### Status 200

```json
{
  "data": {
    "_id": "5ddcf0547a90b0068f2d966f",
    "name": "Dummy todo",
    "creator": {
      "username": "dummy",
      "email": "dummy@mail.com"
    },
    "group": {
      "name": "Dummy group"
    },
    "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error necessitatibus quibusdam est assumenda facilis repellat repudiandae eveniet laborum hic impedit? Delectus saepe fuga dolorum accusantium expedita veniam sapiente esse provident.",
    "dueDate": "2020-01-01T16:59:59.000Z",
    "updatedAt": "2019-11-26T09:28:52.372Z",
    "status": "pending"
  }
}
```



### Edit Todo

##### Endpoint

```http
PUT /todos/:id
```

##### Header

- access_token: String **Required**

##### Param

- id: String **Required** (Todo id to identify which todo to edit)

##### Body

- name: String **Optional**
- description: String **Optional**
- dueDate: String | Date **Optional** (String format: YYYY-MM-DD)

You can edit one, two, or all of those fields, or even none of them. Anytime you access this endpoint, whether you edit any field or not, the `updatedAt` field will always be updated.

##### Response

###### Status 200: OK

```json
{
  "message": "Todo updated",
  "data": {
    "_id": "5ddcf0547a90b0068f2d966f",
    "name": "Updated dummy todo",
    "creator": "5ddb85b06a8fd9fd116889e6",
    "group": {
      "name": "Dummy group"
    },
    "description": "Shorter lorem",
    "dueDate": "2019-12-31T16:59:59.000Z",
    "updatedAt": "2019-11-26T10:37:12.127Z",
    "status": "pending"
  }
}
```



### Update Todo Status

This endpoint is specifically used to mark a todo as `done`  or, for todo that's already marked `done`, unmark it and return it's status to `pending`.

##### Endpoint

```http
PATCH /todos/:id/status
```

##### Header

- access_token: String **Required**

##### Param

- id: String **Required** (Todo id to identify which todo to mark.)

##### Response

###### Status 200: OK

```json
{
  "message": "Todo status changed to done",
  "data": {
    "_id": "5ddcf0547a90b0068f2d966f",
    "name": "Updated dummy todo",
    "creator": "5ddb85b06a8fd9fd116889e6",
    "description": "Shorter lorem",
    "group": {
      "name": "Dummy group"
    },
    "dueDate": "2019-12-31T16:59:59.000Z",
    "updatedAt": "2019-11-26T10:41:59.777Z",
    "status": "done"
  }
}
```



### Delete Todo

##### Endpoint

```http
DELETE /todos/:id
```

##### Header

- access_token: String **Required**

##### Param

- id: String **Required** (Todo id to identify which todo to delete.)

##### Response

###### Status 200: OK

```json
{
	"message": "Todo deleted"
}
```