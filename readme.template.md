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
!INLINE ./example/simple.js
~~~

prints

~~~js
/home/brillout/code/@brillout/find/example/pages/
~~~
