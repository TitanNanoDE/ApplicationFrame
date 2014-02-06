#!/usr/bin/env perl

my $wDir = '.';
my @fileList= ();

# get commplete filelist
opendir($root, $wDir) or die $!;

while (my $dir = readdir($root)) {
    if ($dir ne '.' && $dir ne '..'){
        push(@fileList, "$wDir/$dir");
        }
    }    
closedir($root);

foreach(@fileList){
    if(-d $_){
        opendir($handler, $_) or die $!;
        while (my $dir = readdir($handler)){
            if ($dir ne '.' && $dir ne '..'){
                push(@fileList, "$_/$dir");
                }
            }
        closedir($handler);
        }
    }
@fileList= sort(@fileList);

# exclude special files and directorys
@fileList= grep(!/^$wDir\/\.travis(?!\.).*$/, @fileList);

# only use *.js files
@fileList= grep(/.*\.js$/, @fileList);

print join("\n", @fileList)."\n";

# check scripts
foreach(@fileList){
    open(my $file, "<", $_) or die "can not open '$_'!";
    my $content= do{ local $/; <$file> };
    close($file);
    
#   search for window, navigator, document
    if($content=~ /(?!\w)window(?!\w)/g){ print "<$_> the use of the global window object is not allowed!\n"; exit(1) };
    if($content=~ /(?![\w\.])navigator(?!\w)/g){ print "<$_> the direct use of the global navigator object is not allowed!\n"; exit(1) };
    if($content=~ /(?![\w\.])document(?!\w)/g){ print "<$_> the direct use of the document navigator object is not allowed!\n"; exit(1) };

#   check header
    if($content=~ /^?!(\/\/.*\n)/){ print "<$_> could not find file header!\n"; exit(1) };
    
#   check strict and self (not for libraries)
    if(($_!~ /\/libs\/.*/) && ($content!~ /(this\.self=( )?this(,|;)( )?('|")use strict('|");)/g)){ print "<$_> could not find strict mode!\n"; exit(1) };
    }

print "all right! everything ok!\n";
exit(0);
