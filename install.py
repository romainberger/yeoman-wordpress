"""
    Simple script to globally install a Yeoman generator

    If you want to use this script for your generator just
    change the name in `generator_name` and it should be good
"""

import os
import shutil

generator_name = 'yeoman-wordpress'

yeoman_generator_path = '/usr/local/lib/node_modules/yeoman/node_modules/yeoman-generators/lib/generators'
current_dir = os.path.dirname(os.path.abspath(__file__))
generator_path = os.path.join(yeoman_generator_path, generator_name)

# Check if Yeoman is installed
if not os.path.isdir(yeoman_generator_path):
	print 'It seems that Yeoman is not installed.'
	print 'If you have trouble installing the generator please refer to the install instructions in the Readme.'
	os.exit()

# If the generator is already installed we remove it to avoid errors
if os.path.isdir(generator_path):
	shutil.rmtree(generator_path)
try:
	shutil.copytree(current_dir, generator_path)
	print '\033[32mGenerator installed successfully.\033[37m\n'
except:
	print 'Oops, something went wrong, sorry'
	print 'If you have trouble installing the generator please refer to the install install instructions in the Readme.'
	raise
