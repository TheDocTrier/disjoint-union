site : clean
	hugo

serve :
	hugo serve -D

.PHONY: clean
clean :
	find docs/ -mindepth 1 ! -name CNAME -delete
