
import {alert} from 'webpkit/lib/dialog';
import * as errno_handles from 'webpkit/lib/errno_handles';
import * as React from 'react';

const dialog_handles: Dict<any> = {};

var _handle = function(e: any) {
	var err = Error.new(e);
	var errno = err.errno as number;
	var text = err.message ? (
		<span>
			{err.message}
		</span>
	): <span>未知异常</span>;
	if (errno) {
		if ( !dialog_handles[errno] ) {
			var dag = alert({text}, ()=>{
				delete dialog_handles[errno];
			});
			dialog_handles[errno] = dag;
		}
	} else {
		alert({text});
	}
};

errno_handles.setErrorHandle(_handle);

export default errno_handles.default;