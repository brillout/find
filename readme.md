<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.






-->
Find a file among your project files.

### `@brillout/find`

##### Usage

`find(filename)`
 - filename: `String`. The name of the file you are looking for. It can as well be a directory.
 - returns: `String`. The path to the file or `null`.

The `find` function
first collects all files with a name `filename`
and then returns the collected file
that is closest to the cwd (current working directory, i.e. `process.cwd()`).

The following files are explored:
 - All files (children only) of all directories between the cwd and the root (`/`).
 - All files (children and descendants) of the "project root directory".
   - A *project root directory* is a directory containing `.git`.
     The project root directory is found
     by considering all directories between the cwd and the root.

##### Example

Running

~~~js
// /find/example/simple.js

const find = require('@brillout/find'); // npm install `@brillout/find`
console.log(find('pages/'));
~~~

prints

~~~js
/home/brillout/code/@brillout/find/example/pages/
~~~

<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/readme.template.md` instead.






-->
