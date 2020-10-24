import re

domainMatcher = r'[\[, ]"([a-zA-Z\d-]+(?:\.[a-zA-Z\d-]+)+)"[,\]]'
domainIncMatcher = r'domInc\(\[[\S\n]*?"(.*?)"'
whiteListMatcher = r'Whitelist = \[([\S\n ]*?)\]'

def getDomainsFromFile(filename):
    with open(filename, 'r') as f:
        script = f.read()
        # Remove whitelisted rule
        script = re.sub(whiteListMatcher, '', script)

    return re.findall(domainMatcher, script) + re.findall(domainIncMatcher, script)

domains = getDomainsFromFile('src/content/rules-specific.js')
domains += getDomainsFromFile('src/content/rules-common.js')

domains = list(dict.fromkeys(domains))

with open('domainList.txt', 'w') as w:
    w.write('\n'.join(domains))
