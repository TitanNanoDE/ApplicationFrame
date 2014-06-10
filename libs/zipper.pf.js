/* global self */

self.lib= self.lib || {};

self.lib.zipper= {
	unzip : function(file, callback){
		var fileReader= new self.FileReader();
		fileReader.onloadend= function(){
			var buffer= this.result;
			var viewer= new self.Uint8Array(buffer);
			var cursor= -1;
			var readBytes= function(count){
				var result= 0;
				for(var i= 0; i < count; i++){
					cursor++;
					result= result | (parseInt(intToHex(viewer[cursor]).substr(-2), 16) << (i * 8));
					}
				return result;
			};
			var copyBytes= function(count){
				var result= new self.Uint8Array(count);
				for(var i= 0; i < count; i++){
					cursor++;
					result[i]= viewer[cursor];
					}
				return result;
				};
				
			var intToHex= function(int){
				return(int+0x10000).toString(16).substr(-4).toUpperCase();
				};
				
			var decodeAsString= function(buffer){
				return String.fromCharCode.apply(null, new self.Uint8Array(buffer));
				};
				
			var zip= {
				files : [],
				file_headers : [],
				extra_data : [],
				signatures : [],
				zip64_end_record : [],
				end_record : []
				};
				
			while(cursor < viewer.length-1){
				var signature= readBytes(4); // 0 - 3
				
//				File
				if(signature == 0x04034b50){
					var uncompressed_size, name_length, extra_length, compression;
					zip.files.push({
						version_a : readBytes(2),
						flag : readBytes(2),
						compression : (compression= readBytes(2)),
						time : readBytes(2),
						date : readBytes(2),
						crc : readBytes(4),
						compressed_size : readBytes(4),
						uncompressed_size : (uncompressed_size= readBytes(4)),
						name_length : (name_length= readBytes(2)),
						extra_length : (extra_length= readBytes(2)),
					
						name : decodeAsString(copyBytes(name_length).buffer),
						extra : decodeAsString(copyBytes(extra_length).buffer),
			
						data : (compression === 0) ? copyBytes(uncompressed_size).buffer : self.ArrayBuffer(0)
						});
						
//				Archive extra Data
				}else if(signature == 0x08064b50){
					zip.extra_data.push({
						extra_length : readBytes(4),
						extra : decodeAsString(copyBytes(this.extra_length).buffer)
						});
					
//				File Header
				}else if(signature == 0x02014b50){
					var name_length, extra_length, comment_length;
					zip.file_headers.push({
						version_made : readBytes(2),
						version_needed : readBytes(2),
						flag : readBytes(2),
						compression : readBytes(2),
						time : readBytes(2),
						date : readBytes(2),
						crc : readBytes(4),
						compressed_size : readBytes(4),
						uncompressed_size : readBytes(4),
						name_length : (name_length= readBytes(2), name_length),
						extra_lenghth : (extra_length= readBytes(2), extra_length),
						comment_length : (comment_length= readBytes(2), comment_length),
						diskNumbeStart : readBytes(2),
						internal_attributes : readBytes(2),
						external_attributes : readBytes(4),
						relative_offset : readBytes(4),
					
						name : decodeAsString(copyBytes(name_length).buffer),
						extra : copyBytes(extra_length).buffer,
						comment : decodeAsString(copyBytes(comment_length).buffer)
						});
					
//				Digital signature
				}else if(signature == 0x05054b50){
					var size;
					zip.sigantures.push({
						size : (size= readBytes(2), size),
						data : copyBytes(this.size)
						});
					
//				zip64 end of central directory record
				}else if(signature == 0x06064b50){
					zip.zip64_end_record.push({
						record_size : readBytes(8),
						version_made : readBytes(2),
						version_needed : readBytes(2),
						disk : readBytes(4),
						dir_start_disk : readBytes(4),
						dir_entry_count : readBytes(8),
						size_central_dir : readBytes(8),
						offset : readBytes(8)
						});
					
//				End of central directory record
				}else if(signature == 0x06054b50){
					var comment_length;
					zip.end_record.push({
						disk : readBytes(2),
						start_disk : readBytes(2),
						entries : readBytes(2),
						total_entries : readBytes(2),
						size : readBytes(4),
						start_offset : readBytes(4),
						comment_length : (comment_length= readBytes(2), comment_length),
						comment : decodeAsString(copyBytes(comment_length).buffer)
						});
					}
				}

			callback(zip);
			};
		fileReader.readAsArrayBuffer(file);
		},
		
	zip : function(fileList){
		
		}
	};