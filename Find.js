const assert = require('assertion-soft/hard');
const assert_usage = assert;
const assert_internal = assert;
const find_up = require('find-up');
const glob = require('glob');
const path_module = require('path');
const is_child_directory = require("path-is-inside");
const fs = require('fs');
const ignore = require('ignore')
const glob_gitignore = require('glob-gitignore');


module.exports = Find;

function Find({projectName}) {
    return {
        findProjectFile,
        findProjectDir,
        findProjectRoot,
    };

    function findProjectRoot({cwd=process.cwd()}={}) {
        return find_project_root({cwd});
    }

    function find_project_root({cwd}) {
        assert_internal(cwd);

        const file_at_root = (() => {
            const dot_projectName_path = find_up.sync('.'+projectName, {cwd});
            assert_internal(dot_projectName_path===null || dot_projectName_path.constructor===String);
            if( dot_projectName_path ) {
                return dot_projectName_path;
            }

            const dot_git_path = find_up.sync('.git', {cwd});
            assert_internal(dot_git_path===null || dot_git_path.constructor===String);
            if( dot_git_path ) {
                return dot_git_path;
            }

            assert_usage(
                false,
                "Can't find any file/directory `.git` or `."+projectName+"` while traversing the file tree up to the root `/` starting from `"+cwd+"`.",
                "Hence the project's root directory can't be determined.",
            );
        })();

        const project_root = path_module.resolve(file_at_root, '../');

        return project_root;
    }

    function throw_couldnt_find(msg, {cwd}) {
        assert(msg.constructor===String);

        const project_root = find_project_root({cwd});
        assert(project_root.startsWith('/'));

        assert_usage(
            false,
            "Could't find "+msg+" in project root `"+project_root+"`.",
            "Project root is determined by the location of the files/directories `."+projectName+"` and `.git`."
        );
    }

    function findProjectFile(file_name, {cwd=process.cwd()}={}) {
        return find_project_file({file: file_name}, {may_miss: true, cwd});
    }

    function findProjectDir(dir_name, {cwd=process.cwd()}={}) {
        return find_project_file({dir: dir_name}, {may_miss: true, cwd});
    }

    function find_project_file(thing, {may_miss, within_directory, cwd}={}) {
        assert(('file' in thing) !== ('dir' in thing));
        {
            const name = thing.file || thing.dir;
            assert(name);
            assert(!name.endsWith('/'));
        }

        if( ! within_directory ) {
            within_directory = find_project_root({cwd});
        }


        const hits = find_down({thing, cwd: within_directory});

        assert(hits.constructor===Array);

        if( hits.length===0 ) {
            if( ! may_miss ) {
                const msg =  (thing.file&&'file'||thing.dir&&'directory')+' `'+(thing.file||thing.dir)+'`';
                throw_couldnt_find(msg);
                assert(false);
            }
            return null;
        }

        hits.sort((file1, file2) => {
            return depth(file1) - depth(file2);
            function depth(f) { return path_module.normalize(f).split(path_module.sep).length; }
        });

        const dir = path_module.resolve(within_directory, hits[0]);

        return dir;
    }

    function find_down({thing, cwd}) {
        // - glob also matches if the same;
        //   `assert(glob.sync('/x', {cwd: '/x'})[0]==='/x')`
        // - but `is_child_directory` doesn't
        if( thing.dir && path_module.relative(cwd, thing.file||thing.dir)==='' ) {
            return [cwd];
        }

        // glob matches parent directory;
        // `assert(glob.sync('/x', {cwd: '/x/y'})[0]==='x')`
        if( is_child_directory(cwd, thing.file||thing.dir) ) {
            return [];
        }

        const glob_args = [
            '**/'+(thing.file||(thing.dir+'/')),
            {
                cwd,
                nodir: !thing.dir,
            },
        ];

        {
            const gitignore = get_gitignore_content({cwd});
            if( gitignore ) {
                const ig = ignore().add(gitignore)
                glob_args[1].ignore = ig;
                return glob_gitignore.sync(...glob_args);
            }
        }

        glob_args[1].ignore = '**/node_modules/**/*';

        // in contrast to `glob`, `glob_gitignore` doesn't traverse ignored directories
        return glob_gitignore.sync(...glob_args);
     // return glob.sync(...glob_args);
    }

    function get_gitignore_content({cwd}) {
        try {
            return fs.readFileSync(path_module.join(cwd, './.gitignore')).toString();
        } catch(e) {}
        return null;
    }
}
