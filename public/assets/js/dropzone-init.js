
var dropzoneObj = [];
window.onDidMount_dropzone_init = function (urlFileUpload, funcCallback, funcOnChange, maxFileCount, fileFilter, hasThumbnail, dropzoneClass='dropzone-one') {
    // Dropzone handler
    Dropzone.autoDiscover = false;
    function enableDropzone( classPrefix, autoUpload ) {
        var zone_class =  '.' + classPrefix;
        var zone = $( zone_class );
        var form = zone.closest('form');
        var max_filesize_bytes = zone.data('max-filesize-bytes');
        var max_filseize_mb = Math.ceil( max_filesize_bytes / ( 1024*1024) );
        var options = {
            url: urlFileUpload,
            headers: {'Authorization': localStorage.getItem('token')},
            forceFallback: zone.data('force-fallback'),
            paramName: "ufile",
            autoProcessQueue: autoUpload,
            clickable: zone_class,
            previewsContainer: '#' + classPrefix + '-previews-box',
            uploadMultiple: true,
            parallelUploads: 100,
            maxFilesize: max_filseize_mb,
            timeout: 0,
            addRemoveLinks: !autoUpload,
            acceptedFiles: zone.data('accepted-files'),
            thumbnailWidth: 150,
            thumbnailMethod: 'contain',
            dictDefaultMessage: zone.data('default-message'),
            dictFallbackMessage: zone.data('fallback-message'),
            dictFallbackText: zone.data('fallback-text'),
            dictFileTooBig: zone.data('file-too-big'),
            dictInvalidFileType: zone.data('invalid-file-type'),
            dictResponseError: zone.data('response-error'),
            dictCancelUpload: zone.data('cancel-upload'),
            dictCancelUploadConfirmation: zone.data('cancel-upload-confirmation'),
            dictRemoveFile: zone.data('remove-file'),
            dictRemoveFileConfirmation: zone.data('remove-file-confirmation'),
            dictMaxFilesExceeded: zone.data('max-files-exceeded'),
            onChange: funcOnChange,
            maxFileCount: maxFileCount,
            fileFilter: fileFilter,
            hasThumbnail: hasThumbnail,

            init: function () {
                var dropzone = this;
                dropzoneObj[dropzoneClass] = dropzone;
                this.on( "sending", function () {
                })
                this.on( "successmultiple", function( files, response ) {
                    if(!funcCallback) {
                        return;
                    }
                    funcCallback(true, files, response);
                });
                this.on( "errormultiple", function(files, response) {
                    funcCallback(false, files, response);
                });
                /**
                 * 'addedfiles' is undocumented but works similar to 'addedfile'
                 * It's triggered once after a multiple file addition, and receives
                 * an array with the added files.
                 */
                this.on("addedfile", function(file){
                    if ( file.size > max_filesize_bytes ) {
                        this.removeFile( file );
                    }
                })
                this.on("addedfiles", function (files) {
                    var error_found = false;
                    var text_files = '';
                    for (var i = 0; i < files.length; i++) {
                        if( files[i].size > max_filesize_bytes ) {
                            error_found = true;
                            var size_mb = files[i].size / ( 1024*1024 );
                            var dec = size_mb < 0.01 ? 3 : 2;
                            text_files = text_files + '"' + files[i].name + '" (' + size_mb.toFixed(dec) + ' MB)\n';
                            this.removeFile( files[i] );
                        }
                    }
                    if( error_found ) {
                        var max_mb = max_filesize_bytes / ( 1024*1024 );
                        var max_mb_dec = max_mb < 0.01 ? 3 : 2;
                        var text = zone.data( 'dropzone_multiple_files_too_big' );
                        text = text.replace( '{{files}}', '\n' + text_files + '\n' );
                        text = text.replace( '{{maxFilesize}}', max_mb.toFixed(max_mb_dec) );
                        alert( text );
                    }
                });
            },
            fallback: function() {
                if( $( "." + classPrefix ).length ) {
                    $( "." + classPrefix ).hide();
                }
            }
        };
        var preview_template = document.getElementById('dropzone-preview-template');
        if( preview_template ) {
            options.previewTemplate = preview_template.innerHTML;
        }
        try {
            var zone_object = new Dropzone( form[0], options );
        } catch (e) {
            console.log('dropzone-error:', e);
            alert( zone.data('dropzone-not-supported') );
        }
    }

    var fClass = 'form .' + dropzoneClass;

    $( fClass ).each(function(){
		var classPrefix = dropzoneClass;
		var autoUpload = $(this).hasClass('auto-dropzone');
		enableDropzone( classPrefix, autoUpload );
	});
};

window.onSubmit_dropzone = function(callback, formData, dropzoneClass='dropzone-one') {
    var dropzone = dropzoneObj[dropzoneClass];
    console.log('onsubmit-dropzone:', dropzone);
    if (!dropzone) {
        // console.log('onsubmit-1');
        callback([], formData); // return empty file list
        return;
    }
    if( dropzone.getQueuedFiles().length ) {
        // console.log('onsubmit-2');
        // e.preventDefault();
        dropzone.processQueue();
    } else {
        // console.log('onsubmit-3');
        callback([], formData); // return empty file list
    }
};

window.clear_dropzone = function(dropzoneClass='dropzone-one') {
    var dropzone = dropzoneObj[dropzoneClass];
    if (dropzone) {
        dropzone.removeAllFiles();
    }
};