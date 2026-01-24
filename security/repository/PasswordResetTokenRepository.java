package security.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import security.pojo.PasswordResetToken;
import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUserId(String userId);
}
