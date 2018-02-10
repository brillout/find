const assert = require('reassert');
const assert_usage = assert;
const assert_internal = assert;
const assert_not_implemented = assert;
const find_up_module = require('find-up');
const glob = require('glob');
const path_module = require('path');
const is_child_directory = require("path-is-inside");
const fs = require('fs');
const ignore_module = require('ignore');
const glob_gitignore = require('glob-gitignore');


module.exports = find;


function find(
    input,
    {
      noDir: no_dir = false,
      onlyDir: only_dir = input && input.endsWith('/'),
      anchorFile: anchor_file = null,
      canBeMissing: can_be_missing = false,
      cwd = process.cwd(),
    }={}
) {
    assert_usage(input);

    const filename = input.replace(/\/*$/, '');
    assert_usage(!filename.includes('/'));

    assert_usage(!no_dir || !only_dir);

    const root_files = [
        ...(
            !anchor_file && [] ||
            anchor_file.constructor===Array && anchor_file ||
            [anchor_file]
        ),
        '.git',
    ];

    return find_file({filename, input, no_dir, only_dir, root_files, can_be_missing, cwd});
}

function find_file({filename, input, no_dir, only_dir, root_files, can_be_missing, cwd}) {
    assert_internal(!filename.endsWith('/'));

    const project_root = find_project_root({cwd, root_files});

    const path_found_up = find_up(filename, {cwd, no_dir, only_dir});

    const paths_found__down = project_root && (
        find_down(filename, {cwd: project_root, no_dir, only_dir})
    );

    const paths_found = [
        ...(
            ! path_found_up ? [] : [path_found_up]
        ),
        ...(
            ! project_root ? [] : paths_found__down
        ),
    ];
    assert_internal(paths_found.every(path_found => path_found.startsWith('/')));

    assert_can_be_missing({can_be_missing, paths_found, input, project_root, root_files});

    if( paths_found.length===0 ) {
        return null;
    }

    paths_found.sort(cwd_distance_sorter(cwd));

    /*
    const dir = path_module.resolve(within_directory, paths_found[0]);
    return dir;
    */

    const found = paths_found[0];
    assert_internal(found.startsWith('/'));
    return found;
}

function assert_can_be_missing({can_be_missing, paths_found, input, project_root, root_files}) {
    assert_usage(
        can_be_missing || paths_found.length>0,
        ...(
            [
                "Could not find `"+input+".`",
                project_root && "Could find project root: `"+project_root+"`",
                ! project_root && "Could not find project root.",
                ! project_root && (
                    [
                        "Project root is determined by searching for ",
                        root_files.map(s => '`'+s+'`').join(', '),
                        '.',
                    ].filter(Boolean).join('')
                ),
            ].filter(Boolean)
        )
    );
}

function find_project_root({cwd, root_files}) {
    assert_internal(cwd);

    const file_at_root = (
        root_files
        .map(root_file => {
            const file_path = !root_files ? null : find_up(root_files, {cwd});
            assert_internal(file_path===null || file_path.startsWith('/'));
            return file_path;
        })
        .filter(Boolean)
        .sort(cwd_distance_sorter(cwd))
        [0]
    );

    assert_internal(file_at_root===undefined || file_at_root.startsWith('/'));
    if( ! file_at_root ) {
        return null;
    }

    const project_root = path_module.join(file_at_root, '../');
    return project_root;
}

function find_up(filename, {only_dir, no_dir, cwd}) {
    assert_internal(filename);
    assert_internal(cwd.startsWith('/'));

    /* TODO
    assert_not_implemented(!only_dir);
    assert_not_implemented(!no_dir);
    */

    const found_path = find_up_module.sync(filename);

    assert_internal(found_path===null || found_path.constructor===String && found_path.startsWith('/'));

    return found_path;
}

function find_down(filename, {only_dir, no_dir, cwd}) {
    assert_internal(!filename.includes('/'));
    assert_internal(cwd.startsWith('/'));

    const glob_pattern = '**/'+filename+(only_dir ? '/' : '');

    const glob_options = {
        cwd,
        nodir: no_dir, // doesn't seem to always work in `glob-gitignore` and `glob`
        ignore: get_ignore({cwd}),
    };

    const paths_found = (
        /*
        glob.sync(glob_pattern, glob_options)
        /*/
        glob_gitignore.sync(glob_pattern, glob_options)
        //*/
        .map(relative_path => path_module.join(cwd, relative_path))
    );
    assert_internal(paths_found.length>=0 && paths_found.every(path_found => path_found.startsWith('/')), paths_found);
    return paths_found;
}

function get_ignore({cwd}) {
    const gitignore = get_gitignore_content({cwd});

 // if( ! gitignore ) {
 //     return '**/node_modules/**/*';
 // }

    const gitignore_content = (
        get_gitignore_content({cwd}) || 'node_modules/'
    );

    const ignore = ignore_module().add(gitignore_content);

    return ignore;
}

function get_gitignore_content({cwd}) {
    const gitignore_path = find_up('.gitignore', {cwd, no_dir: true});

    let gitignore_content = null;
    try {
        gitignore_content = fs.readFileSync(gitignore_path).toString();
    } catch(e) {}

    return gitignore_content;
}

function cwd_distance_sorter(cwd) {
    return (
        (file1, file2) => {
            return get_distance_with_cwd(file1, cwd) - get_distance_with_cwd(file2, cwd);
        }
    );
}

function get_distance_with_cwd(path, cwd) {
    assert_internal(cwd);
    assert_internal(path_module.isAbsolute(cwd));
    assert_internal(path);
    assert_internal(path_module.isAbsolute(path));
    const path__relative = path_module.relative(cwd, path);
    const distance = path_depth(path__relative);
    return distance;
}

function path_depth(file) {
    return (
        path_module
        .normalize(file)
        .split(path_module.sep)
        .length
    );
}
