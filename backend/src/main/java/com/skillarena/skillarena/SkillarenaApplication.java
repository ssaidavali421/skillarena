
package com.skillarena.skillarena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.skillarena.skillarena.entity")
@EnableJpaRepositories(basePackages = "com.skillarena.skillarena.repository")
public class SkillarenaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillarenaApplication.class, args);
    }
}
