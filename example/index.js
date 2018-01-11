const find = require('../find');
console.log('=== Find success tests ===');
console.log(find('page1.js'));
console.log(find('pages/'));
require('./parallel_dir/nested_dir');
console.log('=== Find failure tests ===');
console.log(find('page1.js', {onlyDir: true, canBeMissing: true}));
/* doesn't work because of glob bug
console.log(find('pages', {noDir: true, canBeMissing: true}));
*/
console.log(find('page1', {canBeMissing: true}));
try {
    find('page2.js');
    throw new Error('I should not be.');
} catch(err) {
    console.log(err.message);
}
