#!/bin/bash
# Run from /build folder

# Overwrite output with a clean template
cp -f startup-template.js ../out/output.js

# Replace template placeholders with file content
sed -i '/${1}/{
  s/${1}//g
  r ../src/styles.css
}' ../out/output.js
sed -i '/${2}/{
  s/${2}//g
  r ../src/inline-element.html
}' ../out/output.js
sed -i '/${3}/{
  s/${3}//g
  r ../src/scripts.js
}' ../out/output.js
