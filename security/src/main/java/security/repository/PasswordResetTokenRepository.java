package security.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import security.pojo.PasswordResetToken;
import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByOtp(String otp);
    void deleteByUserId(String userId);
}
